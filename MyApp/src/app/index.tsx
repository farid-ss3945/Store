
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar, SafeAreaView, Button, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number | string;
};

type ItemProps = {
  item: Product;
  deleteItem: (id: number) => void;
  selectHandle: (id: number) => void;
  editItem: (p: Product) => void;
};

function Item({ item, deleteItem, selectHandle, editItem }: ItemProps) {
  const [isSelect, setSelect] = useState<boolean>(false);

  return (
    <View style={styles.itemBox}>
      <Text style={styles.text}>{item.id}</Text>
      <Text style={styles.text}>{item.name}</Text>
      <Text style={styles.text}>{item.description}</Text>
      <Text style={styles.text}>{item.category}</Text>
      <Text style={styles.text}>{item.price}</Text>
      <Button
        onPress={() => deleteItem(item.id)}
        title="DELETE"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      <Button
        onPress={() => editItem(item)}
        title="EDIT"
        color="#007AFF"
        accessibilityLabel="Edit product"
      />
      <Button
        onPress={() => {
          setSelect((flag) => !flag)
          selectHandle(item.id)
        }}

        title="SELECT FOR DELETING"
        color={isSelect ? 'red' : 'green'}
        accessibilityLabel="Learn more about this purple button"
      />
    </View>
  )
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:5000/products');
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
          const uniqueCategories = Array.from(new Set(data.products.map((item: Product) => item.category).filter(Boolean))) as string[];
          setCategories(uniqueCategories);
        } else {
          setProducts([]);
          setCategories([]);
        }
      } catch (error) {
        console.error("Ошибка сети:", error);
        setProducts([]);
      }
    }
    fetchData();
  }, []);

  async function deleteItem(id: number) {
    try {
      const res = await fetch('http://localhost:5000/products/' + id,
        { method: 'DELETE' }
      );
      const data = await res.json();

      if (data.success) {
        setProducts((arr) => {
          let i = arr.findIndex((item) => item.id === id)
          let filteredProducts = [...arr]
          filteredProducts.splice(i, 1)
          return filteredProducts
        });
      } else {
        console.log(data)
      }

    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  async function deleteAll() {
    try {
      const res = await fetch('http://localhost:5000/products/bulk',
        {
          method: 'DELETE',
          headers: {
            "Content-type": 'application/json'
          },
          body: JSON.stringify({ ids: selectedProducts })
        }
      );
      const data = await res.json();

      if (data.success) {
        let deletedIds = data.deletedProducts.map((item) => item.id)
        setProducts((arr) => {
          let filteredProducts = arr.filter((item) => !deletedIds.includes(item.id))
          return filteredProducts
        });
        console.log(data)
      } else {
        console.log(data)
      }

    } catch (error) {
      console.error("Ошибка сети:", error);
    }
  }

  async function createItem() {
    if (!name || !price) {
      console.log('Name and price are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, category, description })
      });
      const data = await res.json();

      if (data.success) {
        setProducts((arr) => [data.product, ...arr]);
        setName(''); setPrice(''); setCategory(''); setDescription('');
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  }

  function editItemStart(p: Product) {
    setEditingId(p.id);
    setName(String(p.name));
    setPrice(String(p.price));
    setCategory(p.category);
    setDescription(p.description);
  }

  async function submitEdit() {
    if (editingId === null) return;
    try {
      const res = await fetch('http://localhost:5000/products/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price), category, description })
      });
      const data = await res.json();

      if (data.success) {
        setProducts((arr) => arr.map((it) => it.id === editingId ? data.product : it));
        setEditingId(null);
        setName(''); setPrice(''); setCategory(''); setDescription('');
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  }

  function selectHandle(id: number) {
    let checkedProduct = selectedProducts.includes(id)
    console.log()
    if (checkedProduct) {
      setSelectedProducts((arr) => {
        let i = arr.findIndex((item) => item === id)
        let filteredProducts = [...arr]
        filteredProducts.splice(i, 1)
        return filteredProducts
      });
    } else {
      setSelectedProducts((arr) => {
        let filteredProducts = [...arr, id]
        return filteredProducts
      });
    }
    console.log(selectedProducts)
  }

  const visibleProducts = activeCategory === 'All'
    ? products
    : products.filter((item) => item.category === activeCategory);

  return (
    <SafeAreaProvider>
      <View style={styles.safeArea}>
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Categories</Text>
          <View style={styles.categoryButtonsRow}>
            <Button
              title="All"
              onPress={() => setActiveCategory('All')}
              color={activeCategory === 'All' ? '#007AFF' : '#6c757d'}
            />
            {categories.map((category) => (
              <Button
                key={category}
                title={category}
                onPress={() => setActiveCategory(category)}
                color={activeCategory === category ? '#007AFF' : '#6c757d'}
              />
            ))}
          </View>
        </View>
        <View style={styles.form}>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Price" value={String(price)} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
          {editingId === null ? (
            <Button onPress={createItem} title="CREATE" color={'#28a745'} />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button onPress={submitEdit} title="SAVE" color={'#007AFF'} />
              <Button onPress={() => { setEditingId(null); setName(''); setPrice(''); setCategory(''); setDescription(''); }} title="CANCEL" color={'#6c757d'} />
            </View>
          )}
        </View>
        <Button
          onPress={deleteAll}
          title="DELETE ALL"
          color={'red'}
          accessibilityLabel="Learn more about this purple button"
        />
        <FlatList
          data={visibleProducts}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => <Item item={item} deleteItem={deleteItem} selectHandle={selectHandle} editItem={editItemStart} />}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    padding: 15,
    flex: 1, 
    backgroundColor: '#fff',
    marginTop: StatusBar.currentHeight || 0,

  },
  listContent: {
    flexGrow: 1,            
    justifyContent: 'space-between', 
    alignItems: 'center',   
    paddingVertical: 20,
    gap: 30,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  form: {
    marginBottom: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    width: '100%',
    marginBottom: 6,
  },
  itemBox: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: "45%",
    justifyContent: 'center',
    gap: 20,
  },
  text: {
    textAlign: 'center', 
  }
});
