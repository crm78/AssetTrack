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
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Device, Category, Employee } from '../types';
import { get, post as apiPost, put as apiPut, del as apiDel } from '../services/api';

export default function DeviceListScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  const [formName, setFormName] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formCategoryId, setFormCategoryId] = useState(0);
  const [formStatus, setFormStatus] = useState('可用');
  const [formAssignee, setFormAssignee] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = ['可用', '在用', '维修', '报废'];

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const loadAll = async () => {
    setLoading(true);
    try {
      const [d, c, e] = await Promise.all([
        get<Device[]>('/devices'),
        get<Category[]>('/categories'),
        get<Employee[]>('/employees'),
      ]);
      setDevices(d);
      setCategories(c);
      setEmployees(e);
    } catch (e: any) {
      Alert.alert('加载失败', e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = filterCategoryId === null
    ? devices
    : devices.filter((d) => d.category_id === filterCategoryId);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case '可用': return '#4CAF50';
      case '在用': return '#2196F3';
      case '维修': return '#FF9800';
      case '报废': return '#E53935';
      default: return '#999';
    }
  };

  const showAddForm = () => {
    setFormMode('add');
    setFormName('');
    setFormModel('');
    setFormCategoryId(categories.length > 0 ? (categories[0].id ?? 0) : 0);
    setFormStatus('可用');
    setFormAssignee('');
    setEditingId(null);
    setShowForm(true);
  };

  const showEditForm = (item: Device) => {
    setFormMode('edit');
    setFormName(item.name);
    setFormModel(item.model);
    setFormCategoryId(item.category_id);
    setFormStatus(item.status);
    setFormAssignee(item.employee_name ?? '');
    setEditingId(item.id ?? null);
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!formName || !formModel) {
      Alert.alert('提示', '请填写设备名称和型号');
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        name: formName,
        model: formModel,
        category_id: formCategoryId,
        status: formStatus,
        employee_name: formAssignee,
      };

      if (formMode === 'add') {
        await apiPost<Device>('/devices', data);
      } else {
        await apiPut<Device>('/devices/' + editingId, data);
      }

      setShowForm(false);
      loadAll();
    } catch (e: any) {
      Alert.alert('操作失败', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = (item: Device) => {
    Alert.alert('确认删除', '确定要删除设备 "' + item.name + '" 吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiDel<void>('/devices/' + item.id);
            loadAll();
          } catch (e: any) {
            Alert.alert('删除失败', e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Device }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.model}</Text>
        <View style={styles.tags}>
          <Text style={styles.tagBlue}>
            {item.category_name || ('分类#' + item.category_id)}
          </Text>
          {item.employee_name ? (
            <Text style={[styles.tagGreen, { marginLeft: 6 }]}>
              {item.employee_name}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={() => showEditForm(item)}>
            <Text style={styles.editBtn}>编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteItem(item)}>
            <Text style={[styles.editBtn, { color: '#E53935', marginLeft: 8 }]}>
              删除
            </Text>
          </TouchableOpacity>
        </View>
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

      {/* Filter */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterCategoryId === null && styles.filterChipActive,
            ]}
            onPress={() => setFilterCategoryId(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterCategoryId === null && styles.filterChipTextActive,
              ]}
            >
              全部分类
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.filterChip,
                filterCategoryId === cat.id && styles.filterChipActive,
              ]}
              onPress={() => setFilterCategoryId(cat.id ?? null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterCategoryId === cat.id && styles.filterChipTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && devices.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2196F3" />
      ) : filteredDevices.length === 0 ? (
        <Text style={styles.empty}>暂无设备数据</Text>
      ) : (
        <FlatList
          data={filteredDevices}
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
                {formMode === 'add' ? '添加设备' : '编辑设备'}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: '60%' }}>
              <TextInput
                style={styles.formInput}
                placeholder="设备名称"
                placeholderTextColor="#999"
                value={formName}
                onChangeText={setFormName}
              />
              <TextInput
                style={styles.formInput}
                placeholder="型号"
                placeholderTextColor="#999"
                value={formModel}
                onChangeText={setFormModel}
              />

              <Text style={styles.label}>分类</Text>
              <View style={styles.selectRow}>
                {categories.map((cat, idx) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.selectOption,
                      formCategoryId === cat.id && styles.selectOptionActive,
                    ]}
                    onPress={() => setFormCategoryId(cat.id ?? 0)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formCategoryId === cat.id && styles.selectOptionTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>状态</Text>
              <View style={styles.selectRow}>
                {statusOptions.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.selectOption,
                      formStatus === s && styles.selectOptionActive,
                    ]}
                    onPress={() => setFormStatus(s)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formStatus === s && styles.selectOptionTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>领用人</Text>
              <View style={styles.selectRow}>
                {employees.map((emp, idx) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.selectOption,
                      formAssignee === emp.name && styles.selectOptionActive,
                    ]}
                    onPress={() => setFormAssignee(emp.name)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formAssignee === emp.name && styles.selectOptionTextActive,
                      ]}
                    >
                      {emp.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

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
  filterRow: { paddingHorizontal: 16, paddingVertical: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#2196F3' },
  filterChipText: { fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#fff' },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 2 },
  tags: { flexDirection: 'row', marginTop: 4 },
  tagBlue: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  tagGreen: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  cardRight: { alignItems: 'flex-end' },
  status: {
    fontSize: 12,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
    fontWeight: '500',
  },
  actionRow: { flexDirection: 'row', marginTop: 6 },
  editBtn: { color: '#2196F3', fontSize: 14 },
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
  label: { fontSize: 14, color: '#666', marginBottom: 4, marginTop: 4 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  selectOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 4,
  },
  selectOptionActive: { backgroundColor: '#2196F3' },
  selectOptionText: { fontSize: 14, color: '#333' },
  selectOptionTextActive: { color: '#fff' },
  formButtons: { flexDirection: 'row', marginTop: 8 },
  formBtn: { flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: '#f5f5f5', marginRight: 6 },
  cancelBtnText: { color: '#333', fontSize: 16 },
  saveBtn: { backgroundColor: '#2196F3', marginLeft: 6 },
  saveBtnText: { color: '#fff', fontSize: 16 },
});
