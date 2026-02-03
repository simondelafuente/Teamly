import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { authService } from '../services/auth';

// Función para formatear la fecha a formato 'yyyy-MM-dd'
function formatDate(date) {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Función para formatear la hora a formato 'HH:mm:ss'
function formatTime(date) {
  if (!date) return '';
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}:00`;
}

function adjustDate(date) {
  const adjustedDate = new Date(date);
  adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());
  adjustedDate.setHours(0, 0, 0, 0);
  return adjustedDate;
}

const WebDateInput = ({ value, onChange, style }) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return React.createElement('input', {
    type: 'date',
    value: value,
    onChange: (e) => onChange(e.target.value),
    style: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: COLORS.textDark,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      ...style,
    },
  });
};

const WebTimeInput = ({ value, onChange, style }) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return React.createElement('input', {
    type: 'time',
    value: value,
    onChange: (e) => onChange(e.target.value),
    style: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: COLORS.textDark,
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      fontFamily: 'inherit',
      ...style,
    },
  });
};

const CreatePublicationScreen = ({ navigation, route }) => {
  const { mode, publication } = route.params || {};
  const isEditMode = mode === 'edit' && publication;
  const [publicationId, setPublicationId] = useState(isEditMode ? publication.id_publicacion : null);
  const [titulo, setTitulo] = useState(isEditMode ? publication.titulo || '' : '');
  const [actividadSeleccionada, setActividadSeleccionada] = useState(
    isEditMode && publication.id_actividad
      ? { id_actividad: publication.id_actividad, nombre_actividad: publication.nombre_actividad }
      : null
  );
  const [direccion, setDireccion] = useState(isEditMode ? publication.direccion || '' : '');
  const [zona, setZona] = useState(isEditMode ? publication.zona || '' : '');
  const [vacantes, setVacantes] = useState(isEditMode ? String(publication.vacantes_disponibles || '') : '');
  const [fecha, setFecha] = useState(
    isEditMode && publication.fecha
      ? adjustDate(new Date(publication.fecha))
      : null
  );
  const [hora, setHora] = useState(
    isEditMode && publication.hora
      ? (() => {
        const timeParts = publication.hora.split(':');
        const date = new Date();
        date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
        return date;
      })()
      : null
  );
  const [actividades, setActividades] = useState([]);
  const [showActividadDropdown, setShowActividadDropdown] = useState(false);
  const [showZonaDropdown, setShowZonaDropdown] = useState(false);
  const [actividadSearch, setActividadSearch] = useState('');
  const [zonaSearch, setZonaSearch] = useState('');
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [tempFecha, setTempFecha] = useState(null);
  const [tempHora, setTempHora] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const zonas = [
    'Recoleta',
    'Palermo',
    'San Telmo',
    'Belgrano',
    'Microcentro (Centro)',
    'Caballito',
    'Villa Urquiza',
    'Almagro',
    'Villa Devoto',
    'Puerto Madero',
  ];

  useEffect(() => {
    cargarActividades();
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (isEditMode && actividades.length > 0 && publication.id_actividad && !actividadSeleccionada) {
      const actividad = actividades.find(a => a.id_actividad === publication.id_actividad);
      if (actividad) {
        setActividadSeleccionada(actividad);
      }
    }
  }, [actividades, isEditMode]);

  const cargarUsuario = async () => {
    try {
      const userData = await authService.getUserData();
      if (userData && userData.id_usuario) {
        setUserId(userData.id_usuario);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const cargarActividades = async () => {
    try {
      const response = await apiRequest('/actividades');
      if (response.success && Array.isArray(response.data)) {
        setActividades(response.data);
      }
    } catch (error) {
      console.error('Error fetching actividades:', error);
      Alert.alert('Error', 'No se pudieron cargar las actividades');
    }
  };

  const actividadesFiltradas = actividades.filter((actividad) =>
    actividad.nombre_actividad
      .toLowerCase()
      .includes(actividadSearch.toLowerCase())
  );

  // Filtrar zonas por búsqueda
  const zonasFiltradas = zonas.filter((zonaItem) =>
    zonaItem.toLowerCase().includes(zonaSearch.toLowerCase())
  );

  // Validar formulario
  const validarFormulario = () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título');
      return false;
    }
    if (!actividadSeleccionada) {
      Alert.alert('Error', 'Por favor selecciona una actividad');
      return false;
    }
    if (!vacantes || isNaN(parseInt(vacantes)) || parseInt(vacantes) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido de vacantes disponibles');
      return false;
    }
    if (!fecha) {
      Alert.alert('Error', 'Por favor selecciona una fecha');
      return false;
    }
    if (!hora) {
      Alert.alert('Error', 'Por favor selecciona una hora');
      return false;
    }
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Por favor inicia sesión nuevamente');
      return false;
    }
    return true;
  };

  // Crear o actualizar publicación
  const guardarPublicacion = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const publicacionData = {
        titulo: titulo.trim(),
        direccion: direccion.trim() || null,
        zona: zona || null,
        vacantes_disponibles: parseInt(vacantes),
        fecha: formatDate(fecha),
        hora: formatTime(hora),
        id_usuario: userId,
        id_actividad: actividadSeleccionada.id_actividad,
      };

      let response;
      if (isEditMode && publicationId) {

        response = await apiRequest(`/publicaciones/${publicationId}`, {
          method: 'PUT',
          body: publicacionData,
        });
      } else {
        response = await apiRequest('/publicaciones', {
          method: 'POST',
          body: publicacionData,
        });
      }

      if (response.success) {
        if (!isEditMode) {
          setTitulo('');
          setActividadSeleccionada(null);
          setDireccion('');
          setZona('');
          setVacantes('');
          setFecha(null);
          setHora(null);
        }

        Alert.alert(
          isEditMode ? '¡Publicación Actualizada!' : '¡Publicación Creada!',
          isEditMode
            ? 'Tu publicación ha sido actualizada exitosamente.'
            : 'Tu publicación ha sido creada exitosamente y ya está visible para todos.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (isEditMode) {
                  navigation.navigate('UserPublications', { userId: userId });
                } else {
                  navigation.navigate('Publications', { refresh: true });
                }
              },
            },
          ],
          { cancelable: false }
        );

        setTimeout(() => {
          if (isEditMode) {
            navigation.navigate('UserPublications', { userId: userId });
          } else {
            navigation.navigate('Publications', { refresh: true });
          }
        }, 1200);
      } else {
        throw new Error(response.message || (isEditMode ? 'Error al actualizar la publicación' : 'Error al crear la publicación'));
      }
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} publicación:`, error);
      Alert.alert('Error', error.message || (isEditMode ? 'Error al actualizar la publicación' : 'Error al crear la publicación'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Editar Publicación' : 'Crear Publicación'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Campo Título */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el título de la publicación"
            placeholderTextColor={COLORS.textSecondary}
            value={titulo}
            onChangeText={setTitulo}
            maxLength={100}
          />
        </View>

        {/* Campo Actividad - Dropdown con búsqueda */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Actividad</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowActividadDropdown(!showActividadDropdown);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !actividadSeleccionada && styles.dropdownPlaceholder,
              ]}
            >
              {actividadSeleccionada
                ? actividadSeleccionada.nombre_actividad
                : 'Selecciona una actividad'}
            </Text>
            <Ionicons
              name={showActividadDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          {showActividadDropdown && (
            <View style={styles.dropdownList}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar actividad..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={actividadSearch}
                  onChangeText={setActividadSearch}
                />
                {actividadSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setActividadSearch('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {actividadesFiltradas.map((actividad) => (
                  <TouchableOpacity
                    key={actividad.id_actividad}
                    style={[
                      styles.dropdownItem,
                      actividadSeleccionada?.id_actividad === actividad.id_actividad &&
                      styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setActividadSeleccionada(actividad);
                      setShowActividadDropdown(false);
                      setActividadSearch('');
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        actividadSeleccionada?.id_actividad === actividad.id_actividad &&
                        styles.dropdownItemTextActive,
                      ]}
                    >
                      {actividad.nombre_actividad}
                    </Text>
                  </TouchableOpacity>
                ))}
                {actividadesFiltradas.length === 0 && (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>
                      No se encontraron actividades
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Campo Dirección */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dirección (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa la dirección del evento (opcional)"
            placeholderTextColor={COLORS.textSecondary}
            value={direccion}
            onChangeText={setDireccion}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Campo Zona - Dropdown con búsqueda */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Zona (Opcional)</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowZonaDropdown(!showZonaDropdown);
              setShowActividadDropdown(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !zona && styles.dropdownPlaceholder,
              ]}
            >
              {zona || 'Selecciona una zona (opcional)'}
            </Text>
            <Ionicons
              name={showZonaDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
          {showZonaDropdown && (
            <View style={styles.dropdownList}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar zona..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={zonaSearch}
                  onChangeText={setZonaSearch}
                />
                {zonaSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setZonaSearch('')}>
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {/* Opción para limpiar zona */}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setZona('');
                    setShowZonaDropdown(false);
                    setZonaSearch('');
                  }}
                >
                  <Text style={[styles.dropdownItemText, { fontStyle: 'italic' }]}>
                    Sin zona (opcional)
                  </Text>
                </TouchableOpacity>
                {zonasFiltradas.map((zonaItem) => (
                  <TouchableOpacity
                    key={zonaItem}
                    style={[
                      styles.dropdownItem,
                      zona === zonaItem && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setZona(zonaItem);
                      setShowZonaDropdown(false);
                      setZonaSearch('');
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        zona === zonaItem && styles.dropdownItemTextActive,
                      ]}
                    >
                      {zonaItem}
                    </Text>
                  </TouchableOpacity>
                ))}
                {zonasFiltradas.length === 0 && (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>
                      No se encontraron zonas
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Campo Vacantes Disponibles */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vacantes Disponibles</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 5"
            placeholderTextColor={COLORS.textSecondary}
            value={vacantes}
            onChangeText={(text) => {
              // Solo permitir números
              const numericValue = text.replace(/[^0-9]/g, '');
              setVacantes(numericValue);
            }}
            keyboardType="numeric"
            maxLength={3}
          />
          {vacantes && (
            <Text style={styles.helperText}>
              {parseInt(vacantes) === 1
                ? '1 vacante disponible'
                : `${vacantes} vacantes disponibles`}
            </Text>
          )}
        </View>

        {/* Campo Fecha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primaryBlue} />
              <WebDateInput
                value={fecha ? formatDate(fecha) : ''}
                onChange={(dateString) => {
                  if (dateString) {
                    const selectedDate = new Date(dateString);
                    setFecha(adjustDate(selectedDate));
                  } else {
                    setFecha(null);
                  }
                }}
                style={styles.webDateInput}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setTempFecha(fecha || new Date());
                  setMostrarDatePicker(true);
                }}
                style={styles.dateButton}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primaryBlue} />
                <Text style={styles.dateButtonText}>
                  {fecha ? formatDate(fecha) : 'Selecciona una fecha'}
                </Text>
              </TouchableOpacity>
              {mostrarDatePicker && Platform.OS === 'ios' && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={mostrarDatePicker}
                  onRequestClose={() => {
                    setMostrarDatePicker(false);
                    setTempFecha(null);
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity
                          onPress={() => {
                            setMostrarDatePicker(false);
                            setTempFecha(null);
                          }}
                          style={styles.modalCancelButton}
                        >
                          <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                        <View style={styles.modalConfirmButton} />
                      </View>
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={tempFecha || new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            if (Platform.OS === 'ios') {
                              if (selectedDate) {
                                setTempFecha(selectedDate);
                              }
                            } else {
                              if (selectedDate) {
                                setTempFecha(selectedDate);
                              }
                            }
                          }}
                          style={styles.picker}
                          textColor={COLORS.textDark}
                        />
                      </View>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonConfirm]}
                          onPress={() => {
                            if (tempFecha) {
                              setFecha(adjustDate(tempFecha));
                            }
                            setMostrarDatePicker(false);
                            setTempFecha(null);
                          }}
                        >
                          <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
              {mostrarDatePicker && Platform.OS === 'android' && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={mostrarDatePicker}
                  onRequestClose={() => {
                    setMostrarDatePicker(false);
                    setTempFecha(null);
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setMostrarDatePicker(false);
                            setTempFecha(null);
                          }}
                          style={styles.modalCloseButton}
                        >
                          <Ionicons name="close" size={24} color={COLORS.textDark} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={tempFecha || new Date()}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              setTempFecha(selectedDate);
                            }
                          }}
                          style={styles.picker}
                          textColor={COLORS.textDark}
                        />
                      </View>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonCancel]}
                          onPress={() => {
                            setMostrarDatePicker(false);
                            setTempFecha(null);
                          }}
                        >
                          <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonConfirm]}
                          onPress={() => {
                            if (tempFecha) {
                              setFecha(adjustDate(tempFecha));
                            }
                            setMostrarDatePicker(false);
                            setTempFecha(null);
                          }}
                        >
                          <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
            </>
          )}
        </View>

        {/* Campo Hora */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Hora</Text>
          {Platform.OS === 'web' ? (
            <View style={styles.dateInputContainer}>
              <Ionicons name="time-outline" size={20} color={COLORS.primaryBlue} />
              <WebTimeInput
                value={
                  hora
                    ? `${String(hora.getHours()).padStart(2, '0')}:${String(
                      hora.getMinutes()
                    ).padStart(2, '0')}`
                    : ''
                }
                onChange={(timeString) => {
                  if (timeString) {
                    const [hours, minutes] = timeString.split(':');
                    const timeDate = new Date();
                    timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    setHora(timeDate);
                  } else {
                    setHora(null);
                  }
                }}
                style={styles.webDateInput}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setTempHora(hora || new Date());
                  setMostrarTimePicker(true);
                }}
                style={styles.dateButton}
              >
                <Ionicons name="time-outline" size={20} color={COLORS.primaryBlue} />
                <Text style={styles.dateButtonText}>
                  {hora
                    ? `${String(hora.getHours()).padStart(2, '0')}:${String(
                      hora.getMinutes()
                    ).padStart(2, '0')}`
                    : 'Selecciona una hora'}
                </Text>
              </TouchableOpacity>
              {mostrarTimePicker && Platform.OS === 'ios' && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={mostrarTimePicker}
                  onRequestClose={() => {
                    setMostrarTimePicker(false);
                    setTempHora(null);
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity
                          onPress={() => {
                            setMostrarTimePicker(false);
                            setTempHora(null);
                          }}
                          style={styles.modalCancelButton}
                        >
                          <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Seleccionar Hora</Text>
                        <View style={styles.modalConfirmButton} />
                      </View>
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={tempHora || new Date()}
                          mode="time"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          is24Hour={true}
                          onChange={(event, selectedTime) => {
                            if (Platform.OS === 'ios') {
                              if (selectedTime) {
                                setTempHora(selectedTime);
                              }
                            } else {
                              if (selectedTime) {
                                setTempHora(selectedTime);
                              }
                            }
                          }}
                          style={styles.picker}
                          textColor={COLORS.textDark}
                        />
                      </View>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonConfirm]}
                          onPress={() => {
                            if (tempHora) {
                              setHora(tempHora);
                            }
                            setMostrarTimePicker(false);
                            setTempHora(null);
                          }}
                        >
                          <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
              {mostrarTimePicker && Platform.OS === 'android' && (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={mostrarTimePicker}
                  onRequestClose={() => {
                    setMostrarTimePicker(false);
                    setTempHora(null);
                  }}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Seleccionar Hora</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setMostrarTimePicker(false);
                            setTempHora(null);
                          }}
                          style={styles.modalCloseButton}
                        >
                          <Ionicons name="close" size={24} color={COLORS.textDark} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.pickerContainer}>
                        <DateTimePicker
                          value={tempHora || new Date()}
                          mode="time"
                          display="spinner"
                          is24Hour={true}
                          onChange={(event, selectedTime) => {
                            if (selectedTime) {
                              setTempHora(selectedTime);
                            }
                          }}
                          style={styles.picker}
                          textColor={COLORS.textDark}
                        />
                      </View>
                      <View style={styles.modalButtons}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonCancel]}
                          onPress={() => {
                            setMostrarTimePicker(false);
                            setTempHora(null);
                          }}
                        >
                          <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalButtonConfirm]}
                          onPress={() => {
                            if (tempHora) {
                              setHora(tempHora);
                            }
                            setMostrarTimePicker(false);
                            setTempHora(null);
                          }}
                        >
                          <Text style={styles.modalButtonConfirmText}>Confirmar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              )}
            </>
          )}
        </View>

        {/* Botón Crear */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={guardarPublicacion}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading
              ? (isEditMode ? 'Actualizando...' : 'Creando...')
              : (isEditMode ? 'Actualizar Publicación' : 'Crear Publicación')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer de Navegación */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Publications')}
        >
          <Ionicons name="home" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('CreatePublication')}
        >
          <Ionicons name="add-circle" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('MessagesList')}
        >
          <Ionicons name="chatbubble" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.padding / 2,
  },
  headerTitle: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding * 2,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: SIZES.margin * 1.5,
    zIndex: 1,
  },
  label: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    fontStyle: 'italic',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
  },
  dropdownList: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginLeft: SIZES.margin / 2,
    paddingVertical: SIZES.padding / 2,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryBlue + '20',
  },
  dropdownItemText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
  },
  dropdownItemTextActive: {
    color: COLORS.primaryBlue,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    minHeight: 50,
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginLeft: SIZES.margin / 2,
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webDateInput: {
    // Los estilos se aplican directamente en el componente
  },
  createButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 16,
    paddingVertical: SIZES.padding + 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.margin * 2,
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    padding: SIZES.padding / 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
    minHeight: Platform.OS === 'ios' ? 300 : 250,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textDark,
    flex: 1,
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: SIZES.padding / 2,
  },
  modalCancelButton: {
    padding: SIZES.padding / 2,
    minWidth: 80,
  },
  modalConfirmButton: {
    padding: SIZES.padding / 2,
    minWidth: 80,
    alignItems: 'flex-end',
  },
  pickerContainer: {
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 216 : 180,
    backgroundColor: COLORS.background,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: SIZES.padding,
    paddingBottom: SIZES.padding,
    gap: SIZES.margin,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SIZES.padding + 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  modalButtonCancel: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primaryBlue,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalButtonCancelText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalButtonConfirmText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreatePublicationScreen;

