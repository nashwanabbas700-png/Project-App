import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { DoorOpen, Plus, Search, Edit2, Trash2, Users, Monitor, Building } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme'
import { api } from '../../services/api';
import { Classroom, RoomType } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ModalWrapper } from '../../components/common/ModalWrapper';

const ROOM_TYPES: RoomType[] = ['Lecture Room', 'Computer Lab', 'Science Lab', 'Seminar Hall'];

export const ClassroomManagementScreen: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Classroom>>({
    roomNumber: '',
    building: 'Alan Turing Building',
    capacity: 40,
    type: 'Lecture Room',
    features: ['Projector', 'Air Conditioned'],
    isAvailable: true,
  });

  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      const res = await api.getClassrooms({
        type: selectedType !== 'All' ? selectedType : undefined,
      });
      if (res.success) {
        setClassrooms(res.classrooms);
      }
    } catch (e) {
      console.warn('Failed to load classrooms', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, [selectedType]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      roomNumber: `CR-${100 + classrooms.length + 1}`,
      building: 'Alan Turing Building',
      capacity: 45,
      type: 'Lecture Room',
      features: ['Laser Projector', 'Acoustic Sound System'],
      isAvailable: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (room: Classroom) => {
    setIsEditing(true);
    setFormData({ ...room });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.roomNumber || !formData.building) {
      Alert.alert('Required Fields', 'Please fill in Room Number and Building.');
      return;
    }

    try {
      if (isEditing) {
        await api.updateClassroom(formData.roomNumber!, formData);
        Alert.alert('Success', 'Classroom updated.');
      } else {
        await api.createClassroom(formData);
        Alert.alert('Success', 'Classroom added.');
      }
      setShowModal(false);
      fetchClassrooms();
    } catch (e: any) {
      Alert.alert('Save Failed', e.message);
    }
  };

  const handleDelete = (roomNumber: string) => {
    Alert.alert('Delete Classroom', `Remove ${roomNumber} from campus facilities?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteClassroom(roomNumber);
            fetchClassrooms();
          } catch (e: any) {
            Alert.alert('Delete Failed', e.message);
          }
        },
      },
    ]);
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'Computer Lab':
        return 'info';
      case 'Science Lab':
        return 'success';
      case 'Seminar Hall':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchClassrooms} />}
    >
      {/* Top Action Bar */}
      <View style={styles.topActions}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Campus Facilities</Text>
          <Text style={styles.headerSub}>{classrooms.length} active lecture halls & specialized laboratories</Text>
        </View>
        <Button
          title="Add Room"
          onPress={handleOpenAdd}
          icon={<Plus size={16} color={COLORS.surface} />}
          size="md"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {['All', ...ROOM_TYPES].map((type) => {
          const isSelected = selectedType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Classroom Cards Grid */}
      <View style={styles.list}>
        {classrooms.map((room) => (
          <View key={room.roomNumber} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.roomNum}>{room.roomNumber}</Text>
                  <Badge label={room.type} variant={getTypeVariant(room.type)} size="sm" />
                </View>
                <View style={styles.buildingRow}>
                  <Building size={12} color={COLORS.textMuted} />
                  <Text style={styles.buildingText}>{room.building}</Text>
                </View>
              </View>

              <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleOpenEdit(room)}>
                  <Edit2 size={16} color={COLORS.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: '#FEE2E2' }]}
                  onPress={() => handleDelete(room.roomNumber)}
                >
                  <Trash2 size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Capacity & Features */}
            <View style={styles.metaRow}>
              <View style={styles.capacityBadge}>
                <Users size={14} color={COLORS.primary} />
                <Text style={styles.capacityText}>Capacity: {room.capacity} students</Text>
              </View>

              {room.features && room.features.length > 0 && (
                <View style={styles.featuresWrap}>
                  {room.features.map((feat, idx) => (
                    <View key={idx} style={styles.featChip}>
                      <Text style={styles.featText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Add / Edit Classroom Modal */}
      <ModalWrapper
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={isEditing ? 'Edit Classroom' : 'Add Campus Facility'}
        subtitle="Manage student seating capacity and equipment specifications"
      >
        <Input
          label="Room Number / Designation"
          value={formData.roomNumber}
          onChangeText={(t) => setFormData({ ...formData, roomNumber: t })}
          placeholder="e.g. CR-101 or LAB-CS1"
          editable={!isEditing}
        />

        <Input
          label="Building / Wing"
          value={formData.building}
          onChangeText={(t) => setFormData({ ...formData, building: t })}
          placeholder="Alan Turing Building"
        />

        <Input
          label="Student Seating Capacity"
          value={String(formData.capacity || 40)}
          onChangeText={(t) => setFormData({ ...formData, capacity: Number(t) || 40 })}
          placeholder="40"
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>Classroom Facility Type</Text>
        <View style={styles.typePills}>
          {ROOM_TYPES.map((type) => {
            const isSelected = formData.type === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={isEditing ? 'Update Classroom' : 'Add Classroom'}
          onPress={handleSave}
          style={{ marginTop: SPACING.lg }}
        />
      </ModalWrapper>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: COLORS.textOnDark,
  },
  list: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  roomNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buildingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionBtns: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: SPACING.xs,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  featuresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  featChip: {
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  featText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  typePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  pill: {
    backgroundColor: COLORS.surfaceBlue,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.textOnDark,
  },
});





export default ClassroomManagementScreen;

