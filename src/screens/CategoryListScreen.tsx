import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Category } from '../types';
import { get, post as apiPost, put as apiPut, del as apiDel } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function CategoryListScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formName, setFormName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await get<Category[]>('/categories');
      setCategories(data);
    } catch (e: any) {
      Alert.alert('加载失败', e.message);
    } finally {
      setLoading(false);
    }
  };

  const showAddForm = () => {
    setFormMode('add');
    setFormName('');
    setEditingId(null);
    setShowForm(true);
  };

  const showEditForm = (item: Category) => {
    setFormMode('edit');
    setFormName(item.name);
    setEditingId(item.id ?? null);
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!formName) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }

    setSubmitting(true);
    try {
      const data = { name: formName };

      if (formMode === 'add') {
        await apiPost<Category>('/categories', data);
      } else {
        await apiPut<Category>('/categories/' + editingId, data);
      }

      setShowForm(false);
      loadData();
    } catch (e: any) {
      Alert.alert('操作失败', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = (item: Category) => {
    Alert.alert(
      '确认删除',
      '确定要删除分类 "' + item.name + '" 吗？\n如分类下有设备则无法删除。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDel<void>('/categories/' + item.id);
              loadData();
            } catch (e: any) {
              Alert.alert('删除失败', e.message);
            }
          },
        },
      ]
    );
  };

  const viewDevices = (item: Category) => {
    navigation.navigate('CategoryDevices', {
      categoryId: item.id,
      categoryName: item.name,
    });
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => viewDevices(item)}
      onLongPress={() => {
        Alert.alert(item.name, '', [
          { text: '编辑', onPress: () => showEditForm(item) },
          { text: '删除', style: 'destructive', onPress: () => deleteItem(item) },
          { text: '取消', style: 'cancel' },
        ]);
      }}
    >
      <Text style={styles.gridName}>{item.name}</Text>
      <Text style={styles.gridCount}>
        {item.device_count ?? 0} 台设备
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn} onPress={showAddForm}>
          <Text style={styles.addBtnText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {loading && categories.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2196F3" />
      ) : categories.length === 0 ? (
        <Text style={styles.empty}>暂无分类数据</Text>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id ?? '')}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 10 }}
          contentContainerStyle={{ padding: 6 }}
        />
      )}

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.formPanel}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {formMode === 'add' ? '添加分类' : '编辑分类'}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="分类名称"
              placeholderTextColor="#999"
              value={formName}
              onChangeText={setFormName}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formBtn, styles.cancelBtn]}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelBtnText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBtn, styles.saveBtn]}
                onPress={submitForm}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>保存</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 0,
  },
  addBtn: {
    height: 32,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
  gridItem: {
    flex: 1,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  gridName: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  gridCount: { fontSize: 13, color: '#888' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  formPanel: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { fontSize: 22, color: '#999' },
  formInput: {
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: '#333',
    fontSize: 16,
  },
  formButtons: { flexDirection: 'row', marginTop: 8 },
  formBtn: { flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#f5f5f5', marginRight: 6 },
  cancelBtnText: { color: '#333', fontSize: 16 },
  saveBtn: { backgroundColor: '#2196F3', marginLeft: 6 },
  saveBtnText: { color: '#fff', fontSize: 16 },
});
