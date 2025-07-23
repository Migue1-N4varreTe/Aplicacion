const express = require("express");
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../auth/middleware");

const router = express.Router();

// Generar ticket de venta
router.get("/:sale_id", authenticateToken, async (req, res) => {
  try {
    const { sale_id } = req.params;
    const { format = "json" } = req.query; // json, html, thermal

    // Obtener datos completos de la venta
    const { data: sale, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items(
          *,
          products(
            name,
            sku,
            barcode,
            unit
          )
        ),
        clients(
          name,
          phone,
          email,
          total_points
        ),
        users!sales_cashier_id_fkey(
          name,
          employee_code
        )
      `,
      )
      .eq("id", sale_id)
      .single();

    if (error || !sale) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // Datos básicos del ticket
    const receiptData = {
      // Información del negocio
      business: {
        name: "La Económica",
        address: "Dirección del negocio",
        phone: "Teléfono del negocio",
        tax_id: "RFC del negocio",
      },

      // Información de la venta
      sale: {
        id: sale.id,
        number: sale.sale_number,
        date: sale.created_at,
        cashier: sale.users?.name,
        employee_code: sale.users?.employee_code,
      },

      // Información del cliente
      client: sale.clients
        ? {
            name: sale.clients.name,
            phone: sale.clients.phone,
            email: sale.clients.email,
            points: sale.clients.total_points,
          }
        : null,

      // Items de la venta
      items: sale.sale_items.map((item) => ({
        product_name: item.products.name,
        sku: item.products.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        unit: item.products.unit,
      })),

      // Totales
      totals: {
        subtotal: sale.subtotal,
        discount_amount: sale.discount_amount,
        tax_amount: sale.tax_amount,
        total_amount: sale.total_amount,
        payment_method: sale.payment_method,
        payment_amount: sale.payment_amount,
        change_amount: sale.change_amount,
      },

      // Información adicional
      additional: {
        coupon_code: sale.coupon_code,
        notes: sale.notes,
        items_count: sale.sale_items.length,
        timestamp: new Date().toISOString(),
      },
    };

    // Retornar según el formato solicitado
    if (format === "json") {
      res.json({
        receipt: receiptData,
      });
    } else if (format === "html") {
      const html = generateHTMLReceipt(receiptData);
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } else if (format === "thermal") {
      const thermal = generateThermalReceipt(receiptData);
      res.setHeader("Content-Type", "text/plain");
      res.send(thermal);
    } else {
      res
        .status(400)
        .json({ error: "Formato no válido. Use: json, html, thermal" });
    }
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).json({ error: "Error al generar ticket" });
  }
});

// Reenviar ticket por email
router.post("/:sale_id/email", authenticateToken, async (req, res) => {
  try {
    const { sale_id } = req.params;
    const { email, client_email } = req.body;

    const targetEmail = email || client_email;

    if (!targetEmail) {
      return res.status(400).json({ error: "Email de destino requerido" });
    }

    // Obtener datos de la venta
    const { data: sale, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items(*, products(name, sku)),
        clients(name),
        users(name as cashier_name)
      `,
      )
      .eq("id", sale_id)
      .single();

    if (error || !sale) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // En un entorno real, aquí se enviaría el email
    // Por ahora simularemos el envío
    const emailData = {
      to: targetEmail,
      subject: `Ticket de compra #${sale.sale_number} - La Económica`,
      html: generateHTMLReceipt({
        business: {
          name: "La Económica",
          address: "Dirección del negocio",
          phone: "Teléfono del negocio",
        },
        sale: {
          id: sale.id,
          number: sale.sale_number,
          date: sale.created_at,
          cashier: sale.cashier_name,
        },
        client: sale.clients,
        items: sale.sale_items,
        totals: {
          subtotal: sale.subtotal,
          discount_amount: sale.discount_amount,
          tax_amount: sale.tax_amount,
          total_amount: sale.total_amount,
          payment_method: sale.payment_method,
          payment_amount: sale.payment_amount,
          change_amount: sale.change_amount,
        },
      }),
    };

    // Registrar el envío
    await supabase.from("receipt_emails").insert({
      sale_id,
      email: targetEmail,
      sent_by: req.user.id,
      status: "sent", // En producción sería 'pending' hasta confirmar envío
    });

    res.json({
      message: "Ticket enviado por email exitosamente",
      email: targetEmail,
      sale_number: sale.sale_number,
    });
  } catch (error) {
    console.error("Error sending receipt email:", error);
    res.status(500).json({ error: "Error al enviar ticket por email" });
  }
});

// Generar código QR para ticket digital
router.get("/:sale_id/qr", authenticateToken, async (req, res) => {
  try {
    const { sale_id } = req.params;

    // Verificar que la venta existe
    const { data: sale, error } = await supabase
      .from("sales")
      .select("id, sale_number")
      .eq("id", sale_id)
      .single();

    if (error || !sale) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // URL para acceder al ticket digital
    const ticketUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/receipt/${sale_id}`;

    res.json({
      qr_url: ticketUrl,
      sale_id: sale.id,
      sale_number: sale.sale_number,
      message: "Código QR generado para ticket digital",
    });
  } catch (error) {
    console.error("Error generating QR:", error);
    res.status(500).json({ error: "Error al generar código QR" });
  }
});

// Función para generar HTML del ticket
function generateHTMLReceipt(data) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleString("es-MX");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ticket #${data.sale.number}</title>
      <style>
        body { font-family: monospace; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        .item { display: flex; justify-content: space-between; }
        .total { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="center">
        <h2>${data.business.name}</h2>
        <p>${data.business.address}</p>
        <p>Tel: ${data.business.phone}</p>
      </div>
      
      <div class="line"></div>
      
      <p><strong>Ticket:</strong> #${data.sale.number}</p>
      <p><strong>Fecha:</strong> ${formatDate(data.sale.date)}</p>
      <p><strong>Cajero:</strong> ${data.sale.cashier}</p>
      ${data.client ? `<p><strong>Cliente:</strong> ${data.client.name}</p>` : ""}
      
      <div class="line"></div>
      
      ${data.items
        .map(
          (item) => `
        <div class="item">
          <span>${item.product_name}</span>
        </div>
        <div class="item">
          <span>${item.quantity} x ${formatCurrency(item.unit_price)}</span>
          <span>${formatCurrency(item.subtotal)}</span>
        </div>
      `,
        )
        .join("")}
      
      <div class="line"></div>
      
      <div class="item">
        <span>Subtotal:</span>
        <span>${formatCurrency(data.totals.subtotal)}</span>
      </div>
      
      ${
        data.totals.discount_amount > 0
          ? `
        <div class="item">
          <span>Descuento:</span>
          <span>-${formatCurrency(data.totals.discount_amount)}</span>
        </div>
      `
          : ""
      }
      
      <div class="item total">
        <span>TOTAL:</span>
        <span>${formatCurrency(data.totals.total_amount)}</span>
      </div>
      
      <div class="item">
        <span>Pago (${data.totals.payment_method}):</span>
        <span>${formatCurrency(data.totals.payment_amount)}</span>
      </div>
      
      ${
        data.totals.change_amount > 0
          ? `
        <div class="item">
          <span>Cambio:</span>
          <span>${formatCurrency(data.totals.change_amount)}</span>
        </div>
      `
          : ""
      }
      
      <div class="line"></div>
      
      <div class="center">
        <p>¡Gracias por su compra!</p>
        <p>Conserve su ticket</p>
      </div>
    </body>
    </html>
  `;
}

// Función para generar formato térmico (texto plano)
function generateThermalReceipt(data) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleString("es-MX");
  const centerText = (text, width = 32) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(padding) + text;
  };
  const rightAlign = (text, width = 32) => {
    return text.padStart(width);
  };

  let receipt = "";

  // Encabezado
  receipt += centerText(data.business.name) + "\n";
  receipt += centerText(data.business.address) + "\n";
  receipt += centerText(`Tel: ${data.business.phone}`) + "\n";
  receipt += "================================\n";

  // Información de venta
  receipt += `Ticket: #${data.sale.number}\n`;
  receipt += `Fecha: ${formatDate(data.sale.date)}\n`;
  receipt += `Cajero: ${data.sale.cashier}\n`;
  if (data.client) {
    receipt += `Cliente: ${data.client.name}\n`;
  }
  receipt += "--------------------------------\n";

  // Items
  data.items.forEach((item) => {
    receipt += `${item.product_name}\n`;
    const line = `${item.quantity} x ${formatCurrency(item.unit_price)}`;
    const price = formatCurrency(item.subtotal);
    receipt += line.padEnd(32 - price.length) + price + "\n";
  });

  receipt += "--------------------------------\n";

  // Totales
  receipt +=
    "Subtotal:".padEnd(24) +
    formatCurrency(data.totals.subtotal).padStart(8) +
    "\n";

  if (data.totals.discount_amount > 0) {
    receipt +=
      "Descuento:".padEnd(24) +
      ("-" + formatCurrency(data.totals.discount_amount)).padStart(8) +
      "\n";
  }

  receipt +=
    "TOTAL:".padEnd(24) +
    formatCurrency(data.totals.total_amount).padStart(8) +
    "\n";
  receipt += "================================\n";

  receipt +=
    `Pago (${data.totals.payment_method}):`.padEnd(24) +
    formatCurrency(data.totals.payment_amount).padStart(8) +
    "\n";

  if (data.totals.change_amount > 0) {
    receipt +=
      "Cambio:".padEnd(24) +
      formatCurrency(data.totals.change_amount).padStart(8) +
      "\n";
  }

  receipt += "================================\n";
  receipt += centerText("¡Gracias por su compra!") + "\n";
  receipt += centerText("Conserve su ticket") + "\n";
  receipt += "\n\n\n"; // Espacio para corte

  return receipt;
}

module.exports = router;
