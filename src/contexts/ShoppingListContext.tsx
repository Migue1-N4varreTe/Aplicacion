import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, allProducts } from "@/lib/data";

export interface ShoppingListItem {
  id: string;
  productId: string;
  quantity: number;
  addedAt: Date;
  notes?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  sharedWith: string[];
  ownerId: string;
  category: "personal" | "family" | "work" | "recurring";
  targetDate?: Date;
  estimatedTotal: number;
}

interface ShoppingListContextType {
  lists: ShoppingList[];
  activeList: ShoppingList | null;
  createList: (name: string, description?: string, category?: ShoppingList["category"]) => ShoppingList;
  deleteList: (listId: string) => void;
  updateList: (listId: string, updates: Partial<ShoppingList>) => void;
  setActiveList: (listId: string | null) => void;
  addItemToList: (listId: string, productId: string, quantity?: number, notes?: string) => void;
  removeItemFromList: (listId: string, itemId: string) => void;
  updateListItem: (listId: string, itemId: string, updates: Partial<ShoppingListItem>) => void;
  toggleItemCompleted: (listId: string, itemId: string) => void;
  shareList: (listId: string, emails: string[]) => void;
  duplicateList: (listId: string, newName: string) => ShoppingList;
  importFromCart: () => ShoppingList;
  exportToCart: (listId: string) => void;
  getListsStats: () => {
    totalLists: number;
    completedItems: number;
    pendingItems: number;
    totalEstimatedValue: number;
  };
}

const ShoppingListContext = createContext<ShoppingListContextType | undefined>(undefined);

export const useShoppingList = () => {
  const context = useContext(ShoppingListContext);
  if (context === undefined) {
    throw new Error("useShoppingList must be used within a ShoppingListProvider");
  }
  return context;
};

export const ShoppingListProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveListState] = useState<ShoppingList | null>(null);

  // Load lists from localStorage on mount
  useEffect(() => {
    const savedLists = localStorage.getItem("la_economica_shopping_lists");
    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);
        const listsWithDates = parsedLists.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          targetDate: list.targetDate ? new Date(list.targetDate) : undefined,
          items: list.items.map((item: any) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          })),
        }));
        setLists(listsWithDates);
      } catch (error) {
        console.error("Error loading shopping lists:", error);
        localStorage.removeItem("la_economica_shopping_lists");
      }
    }
  }, []);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("la_economica_shopping_lists", JSON.stringify(lists));
  }, [lists]);

  const generateId = () => `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const calculateEstimatedTotal = (items: ShoppingListItem[]): number => {
    return items.reduce((total, item) => {
      const product = allProducts.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const createList = (
    name: string, 
    description?: string, 
    category: ShoppingList["category"] = "personal"
  ): ShoppingList => {
    const newList: ShoppingList = {
      id: generateId(),
      name,
      description,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isShared: false,
      sharedWith: [],
      ownerId: "current_user", // TODO: Get from auth context
      category,
      estimatedTotal: 0,
    };

    setLists(prev => [newList, ...prev]);
    return newList;
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    if (activeList?.id === listId) {
      setActiveListState(null);
    }
  };

  const updateList = (listId: string, updates: Partial<ShoppingList>) => {
    setLists(prev => prev.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            ...updates, 
            updatedAt: new Date(),
            estimatedTotal: updates.items 
              ? calculateEstimatedTotal(updates.items)
              : list.estimatedTotal
          }
        : list
    ));
  };

  const setActiveList = (listId: string | null) => {
    const list = listId ? lists.find(l => l.id === listId) || null : null;
    setActiveListState(list);
  };

  const addItemToList = (
    listId: string, 
    productId: string, 
    quantity: number = 1, 
    notes?: string
  ) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;

      const existingItem = list.items.find(item => item.productId === productId);
      let updatedItems;

      if (existingItem) {
        // Update quantity if item already exists
        updatedItems = list.items.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      } else {
        // Add new item
        const newItem: ShoppingListItem = {
          id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          quantity,
          addedAt: new Date(),
          notes,
          priority: "medium",
          completed: false,
        };
        updatedItems = [...list.items, newItem];
      }

      return {
        ...list,
        items: updatedItems,
        updatedAt: new Date(),
        estimatedTotal: calculateEstimatedTotal(updatedItems),
      };
    }));
  };

  const removeItemFromList = (listId: string, itemId: string) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;

      const updatedItems = list.items.filter(item => item.id !== itemId);
      return {
        ...list,
        items: updatedItems,
        updatedAt: new Date(),
        estimatedTotal: calculateEstimatedTotal(updatedItems),
      };
    }));
  };

  const updateListItem = (listId: string, itemId: string, updates: Partial<ShoppingListItem>) => {
    setLists(prev => prev.map(list => {
      if (list.id !== listId) return list;

      const updatedItems = list.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );

      return {
        ...list,
        items: updatedItems,
        updatedAt: new Date(),
        estimatedTotal: calculateEstimatedTotal(updatedItems),
      };
    }));
  };

  const toggleItemCompleted = (listId: string, itemId: string) => {
    updateListItem(listId, itemId, { 
      completed: !lists.find(l => l.id === listId)?.items.find(i => i.id === itemId)?.completed 
    });
  };

  const shareList = (listId: string, emails: string[]) => {
    updateList(listId, {
      isShared: true,
      sharedWith: emails,
    });
  };

  const duplicateList = (listId: string, newName: string): ShoppingList => {
    const originalList = lists.find(l => l.id === listId);
    if (!originalList) throw new Error("List not found");

    const duplicatedList: ShoppingList = {
      ...originalList,
      id: generateId(),
      name: newName,
      createdAt: new Date(),
      updatedAt: new Date(),
      isShared: false,
      sharedWith: [],
      items: originalList.items.map(item => ({
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date(),
        completed: false,
      })),
    };

    setLists(prev => [duplicatedList, ...prev]);
    return duplicatedList;
  };

  const importFromCart = (): ShoppingList => {
    // TODO: Integrate with CartContext
    const cartItems = JSON.parse(localStorage.getItem("la_economica_cart") || "[]");
    
    const newList = createList("Lista del Carrito", "Importada desde el carrito de compras");
    
    cartItems.forEach((cartItem: any) => {
      addItemToList(newList.id, cartItem.id, cartItem.quantity);
    });

    return newList;
  };

  const exportToCart = (listId: string) => {
    // TODO: Integrate with CartContext
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    // Clear current cart and add list items
    const cartItems = list.items.map(item => ({
      id: item.productId,
      quantity: item.quantity,
      addedAt: item.addedAt,
    }));

    localStorage.setItem("la_economica_cart", JSON.stringify(cartItems));
  };

  const getListsStats = () => {
    const totalLists = lists.length;
    const allItems = lists.flatMap(list => list.items);
    const completedItems = allItems.filter(item => item.completed).length;
    const pendingItems = allItems.filter(item => !item.completed).length;
    const totalEstimatedValue = lists.reduce((sum, list) => sum + list.estimatedTotal, 0);

    return {
      totalLists,
      completedItems,
      pendingItems,
      totalEstimatedValue,
    };
  };

  const value: ShoppingListContextType = {
    lists,
    activeList,
    createList,
    deleteList,
    updateList,
    setActiveList,
    addItemToList,
    removeItemFromList,
    updateListItem,
    toggleItemCompleted,
    shareList,
    duplicateList,
    importFromCart,
    exportToCart,
    getListsStats,
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};
