import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Device } from '../types';
import { get } from '../services/api';

type RouteParams = {
  CategoryDevices: { categoryId: number; categoryName: string };
};

export default function CategoryDevicesScreen() {
  const route = useRoute<RouteProp<RouteParams, 'CategoryDevices'>>();
  const { categoryId, categoryName } = route.params;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoryId > 0) {
      loadData(categoryId);
    }
  }, [categoryId]);

  const loadData = async (id: number) => {
    setLoading(true);
    try {
      const data = await get<Device[]>('/categories/' + id + '/devices');
      setDevices(data);
    } catch (e: any) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case '可用': return '#4CAF50';
      case '在用': return '#2196F3';
      case '维修': return '#FF9800';
      case '报废': return '#E53935';
      default: return '#999';
    }
  };

  const renderItem = ({ item }: { item: Device }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>型号: {item.model}</Text>
      <View style={styles.infoRow}>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          状态: {item.status}
        </Text>
        <Text style={styles.assignee}>
          领用: {item.employee_name ?? '未分配'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && devices.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2196F3" />
      ) : devices.length === 0 ? (
        <Text style={styles.empty}>该分类下暂无设备</Text>
      ) : (
        <FlatList
          data={devices}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id ?? '')}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            <Text style={styles.count}>
              {categoryName} - 共 {devices.length} 台设备
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  count: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 4 },
  infoRow: { flexDirection: 'row' },
  status: { fontSize: 12, fontWeight: '500' },
  assignee: { fontSize: 12, color: '#666', marginLeft: 16 },
});
