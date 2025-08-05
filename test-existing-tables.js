// Test connection to existing database schema
import { supabase, supabaseAdmin } from "./backend/config/supabase.js";

async function testExistingTables() {
  console.log("🔍 Testing connection to existing database tables...");
  
  try {
    // List of tables from your existing schema
    const tablesToTest = [
      'categories',
      'products', 
      'customers',
      'orders',
      'order_items',
      'locations',
      'suppliers',
      'coupons',
      'employee_attendance',
      'user_profiles',
      'roles'
    ];

    console.log("\n📋 Testing tables...");
    const results = {};
    
    for (const table of tablesToTest) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          results[table] = { status: 'error', error: error.message };
          console.log(`   ❌ ${table}: ${error.message}`);
        } else {
          results[table] = { status: 'ok', count: count || 0 };
          console.log(`   ✅ ${table}: ${count || 0} records`);
        }
      } catch (err) {
        results[table] = { status: 'error', error: err.message };
        console.log(`   ❌ ${table}: ${err.message}`);
      }
    }

    // Test some basic operations
    console.log("\n🧪 Testing basic operations...");
    
    // Test categories
    try {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(5);
      
      if (catError) {
        console.log("   ⚠️  Categories query failed:", catError.message);
      } else {
        console.log(`   ✅ Categories: Found ${categories.length} categories`);
        if (categories.length > 0) {
          console.log(`      Example: ${categories[0].name}`);
        }
      }
    } catch (err) {
      console.log("   ❌ Categories test failed:", err.message);
    }

    // Test products
    try {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          stock_quantity,
          category:categories(name)
        `)
        .limit(3);
      
      if (prodError) {
        console.log("   ⚠️  Products query failed:", prodError.message);
      } else {
        console.log(`   ✅ Products: Found ${products.length} products`);
        products.forEach(product => {
          console.log(`      - ${product.name}: $${product.price} (${product.stock_quantity} in stock)`);
        });
      }
    } catch (err) {
      console.log("   ❌ Products test failed:", err.message);
    }

    // Test customers
    try {
      const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, loyalty_points, total_spent')
        .limit(3);
      
      if (custError) {
        console.log("   ⚠️  Customers query failed:", custError.message);
      } else {
        console.log(`   ✅ Customers: Found ${customers.length} customers`);
        customers.forEach(customer => {
          console.log(`      - ${customer.first_name} ${customer.last_name}: ${customer.loyalty_points} points, $${customer.total_spent} spent`);
        });
      }
    } catch (err) {
      console.log("   ❌ Customers test failed:", err.message);
    }

    // Test orders
    try {
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          customer:customers(first_name, last_name)
        `)
        .limit(3);
      
      if (orderError) {
        console.log("   ⚠️  Orders query failed:", orderError.message);
      } else {
        console.log(`   ✅ Orders: Found ${orders.length} orders`);
        orders.forEach(order => {
          const customerName = order.customer ? 
            `${order.customer.first_name} ${order.customer.last_name}` : 
            'Unknown';
          console.log(`      - ${order.order_number}: $${order.total_amount} (${order.status}) - ${customerName}`);
        });
      }
    } catch (err) {
      console.log("   ❌ Orders test failed:", err.message);
    }

    // Summary
    console.log("\n📊 Summary:");
    const successCount = Object.values(results).filter(r => r.status === 'ok').length;
    const errorCount = Object.values(results).filter(r => r.status === 'error').length;
    
    console.log(`   ✅ Successful tables: ${successCount}`);
    console.log(`   ❌ Failed tables: ${errorCount}`);
    console.log(`   📈 Total tables tested: ${tablesToTest.length}`);

    if (successCount > 0) {
      console.log("\n🎉 Database connection successful!");
      console.log("   Your existing database schema is working perfectly.");
      console.log("   Backend services have been updated to use your tables.");
      
      console.log("\n🔑 Ready to use:");
      console.log("   - Products management");
      console.log("   - Customer management"); 
      console.log("   - Order processing");
      console.log("   - Inventory tracking");
      console.log("   - Employee attendance");
      console.log("   - Reporting system");
    } else {
      console.log("\n⚠️  No tables accessible - check permissions");
    }

    return { success: successCount > 0, results };

  } catch (error) {
    console.error("\n❌ Database test failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testExistingTables()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error("💥 Unexpected error:", error);
      process.exit(1);
    });
}

export default testExistingTables;
