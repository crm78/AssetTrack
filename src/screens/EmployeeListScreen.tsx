import React, { useState, useEffect, useCallback } from 'react';
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
import { Employee } from '../types';
import { get, post as apiPost, put as apiPut, del as apiDel } from '../services/api';

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formEmail, setFormEmail] = useState('');
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
      const data = await get<Employee[]>('/employees');
      setEmployees(data);
    } catch (e: any) {
      Alert.alert('加载失败', e.message);
    } finally {
      setLoading(false);
    }
  };

  const showAddForm = () => {
    setFormMode('add');
    setFormName('');
    setFormAge('');
    setFormEmail('');
    setEditingId(null);
    setShowForm(true);
  };

  const showEditForm = (item: Employee) => {
    setFormMode('edit');
    setFormName(item.name);
    setFormAge(String(item.age));
    setFormEmail(item.email);
    setEditingId(item.id ?? null);
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!formName || !formAge || !formEmail) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setSubmitting(true);
    try {
      const data = { name: formName, age: parseInt(formAge, 10), email: formEmail };

      if (formMode === 'add') {
        await apiPost<Employee>('/employees', data);
      } else {
        await apiPut<Employee>('/employees/' + editingId, data);
      }

      setShowForm(false);
      loadData();
    } catch (e: any) {
      Alert.alert('操作失败', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = (item: Employee) => {
    Alert.alert('确认删除', '确定要删除员工 "' + item.name + '" 吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDel<void>('/employees/' + item.id);
            loadData();
          } catch (e: any) {
            Alert.alert('删除失败', e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Employee }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>年龄: {item.age}</Text>
        <Text style={styles.meta}>{item.email}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => showEditForm(item)}>
          <Text style={styles.editBtn}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteItem(item)}>
          <Text style={styles.deleteBtn}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addBtn} onPress={showAddForm}>
          <Text style={styles.addBtnText}>+ 添加</Text>
        </TouchableOpacity>
      </View>

      {loading && employees.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2196F3" />
      ) : employees.length === 0 ? (
        <Text style={styles.empty}>暂无员工数据</Text>
      ) : (
        <FlatList
          data={employees}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id ?? '')}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.formPanel}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {formMode === 'add' ? '添加员工' : '编辑员工'}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.formInput}
              placeholder="姓名"
              placeholderTextColor="#999"
              value={formName}
              onChangeText={setFormName}
            />
            <TextInput
              style={styles.formInput}
              placeholder="年龄"
              placeholderTextColor="#999"
              value={formAge}
              onChangeText={setFormAge}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.formInput}
              placeholder="邮箱"
              placeholderTextColor="#999"
              value={formEmail}
              onChangeText={setFormEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 2 },
  cardActions: { alignItems: 'flex-end' },
  editBtn: { color: '#2196F3', fontSize: 14, marginBottom: 8 },
  deleteBtn: { color: '#E53935', fontSize: 14 },
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
  formBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#f5f5f5', marginRight: 6 },
  cancelBtnText: { color: '#333', fontSize: 16 },
  saveBtn: { backgroundColor: '#2196F3', marginLeft: 6 },
  saveBtnText: { color: '#fff', fontSize: 16 },
});
