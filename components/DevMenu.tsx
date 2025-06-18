import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';

interface DevMenuButton {
  title: string;
  onPress: () => void;
}

interface DevMenuProps {
  extraButtons?: DevMenuButton[];
}

export default function DevMenu({ extraButtons = [] }: DevMenuProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!__DEV__) {
    return null;
  }

  const menuItems = [
    {
      title: 'Analytics Test',
      onPress: () => {
        router.push('/(dev)/analytics-test');
        setIsVisible(false);
      }
    },
    // Add more test screens here
  ];

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.triggerText}>DEV</Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Development Menu</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <X color="#000" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.extraButtons}>
              {extraButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.extraButton}
                  onPress={button.onPress}
                >
                  <Text style={styles.extraButtonText}>{button.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  triggerText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  menuItemText: {
    fontSize: 18,
  },
  extraButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  extraButton: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 4,
  },
  extraButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 