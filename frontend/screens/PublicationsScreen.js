import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES } from '../utils/constants';
import { apiRequest } from '../config/api';
import { getImageWithFallback } from '../utils/imageHelper';

// Función para formatear la fecha a formato 'yyyy-MM-dd'
function formatDate(date) {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

// Función para formatear fecha para mostrar
function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Función para formatear la hora (solo horas y minutos, sin segundos)
function formatTime(timeString) {
  if (!timeString) return '';
  // Si viene en formato HH:MM:SS, solo tomar HH:MM
  if (timeString.includes(':')) {
    const parts = timeString.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return timeString;
}

// Función para ajustar la fecha, evitando el cambio de día
function adjustDate(date) {
  const adjustedDate = new Date(date);
  adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());
  adjustedDate.setHours(0, 0, 0, 0);
  return adjustedDate;
}

// Componente para input de fecha en web
const WebDateInput = ({ value, onChange, style }) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  // Usar createElement para crear el input HTML nativo en web
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

const PublicationsScreen = ({ navigation }) => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [actividades, setActividades] = useState([]);
  
  // Estados para filtros temporales (mientras se configuran)
  const [actividadFiltro, setActividadFiltro] = useState('');
  const [fecha, setFecha] = useState(null);
  const [zona, setZona] = useState('');
  
  // Estados para filtros aplicados (los que realmente filtran)
  const [actividadFiltroAplicado, setActividadFiltroAplicado] = useState('');
  const [fechaAplicada, setFechaAplicada] = useState(null);
  const [zonaAplicada, setZonaAplicada] = useState('');
  
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para dropdowns con búsqueda
  const [showActividadDropdown, setShowActividadDropdown] = useState(false);
  const [showZonaDropdown, setShowZonaDropdown] = useState(false);
  const [actividadSearch, setActividadSearch] = useState('');
  const [zonaSearch, setZonaSearch] = useState('');

  // Zonas disponibles (puedes ajustar según tu necesidad)
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

  // Cargar publicaciones
  const cargarPublicaciones = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/publicaciones');
      if (response.success && Array.isArray(response.data)) {
        setPublicaciones(response.data);
      } else {
        console.error('La respuesta no contiene un arreglo de publicaciones:', response);
        setPublicaciones([]);
      }
    } catch (error) {
      console.error('Error fetching publicaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las publicaciones');
      setPublicaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar actividades
  const cargarActividades = async () => {
    try {
      const response = await apiRequest('/actividades');
      if (response.success && Array.isArray(response.data)) {
        setActividades(response.data);
      }
    } catch (error) {
      console.error('Error fetching actividades:', error);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
    cargarActividades();
  }, []);

  // Refrescar publicaciones cuando la pantalla recibe el foco (al regresar de otra pantalla)
  useFocusEffect(
    React.useCallback(() => {
      cargarPublicaciones();
    }, [])
  );

  // Cerrar dropdowns cuando se toque fuera
  useEffect(() => {
    const closeDropdowns = () => {
      setShowActividadDropdown(false);
      setShowZonaDropdown(false);
    };
    // Los dropdowns se cerrarán cuando se seleccione una opción o se toque fuera
  }, []);

  // Aplicar filtros
  const aplicarFiltros = () => {
    // Copiar los filtros temporales a los filtros aplicados
    setActividadFiltroAplicado(actividadFiltro);
    setFechaAplicada(fecha);
    setZonaAplicada(zona);
    // Ocultar los filtros después de aplicarlos
    setShowFilters(false);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setActividadFiltro('');
    setFecha(null);
    setZona('');
    setActividadFiltroAplicado('');
    setFechaAplicada(null);
    setZonaAplicada('');
    setShowFilters(false);
  };

  // Filtrar actividades por búsqueda
  const actividadesFiltradas = actividades.filter((actividad) =>
    actividad.nombre_actividad
      .toLowerCase()
      .includes(actividadSearch.toLowerCase())
  );

  // Filtrar zonas por búsqueda
  const zonasFiltradas = zonas.filter((zonaItem) =>
    zonaItem.toLowerCase().includes(zonaSearch.toLowerCase())
  );

  // Filtrar publicaciones localmente usando los filtros aplicados
  const publicacionesFiltradas = publicaciones.filter((publicacion) => {
    const coincideActividad =
      !actividadFiltroAplicado || publicacion.nombre_actividad === actividadFiltroAplicado;
    const coincideFecha = !fechaAplicada || formatDate(new Date(publicacion.fecha)) === formatDate(fechaAplicada);
    // Buscar en el campo zona primero, si no existe, buscar en dirección
    const coincideZona = !zonaAplicada || 
      (publicacion.zona && publicacion.zona.toLowerCase() === zonaAplicada.toLowerCase()) ||
      (!publicacion.zona && publicacion.direccion?.toLowerCase().includes(zonaAplicada.toLowerCase()));
    return coincideActividad && coincideFecha && coincideZona;
  });

  // Refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    cargarPublicaciones().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>¡Únete a un Grupo!</Text>

      {/* Botón para mostrar/ocultar filtros */}
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity
          style={styles.filterToggleButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name={showFilters ? 'filter' : 'filter-outline'} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.filterToggleButtonText}>
            {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
          </Text>
        </TouchableOpacity>
        {(actividadFiltroAplicado || fechaAplicada || zonaAplicada) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={limpiarFiltros}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.primaryBlue} />
            <Text style={styles.clearFiltersText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros - Solo se muestran si showFilters es true */}
      {showFilters && (
        <View style={styles.filtrosContainer}>
        {/* Filtro por Actividad - Dropdown con búsqueda */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Actividad:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowActividadDropdown(!showActividadDropdown);
              setShowZonaDropdown(false);
            }}
          >
            <Text
              style={[
                styles.dropdownText,
                !actividadFiltro && styles.dropdownPlaceholder,
              ]}
            >
              {actividadFiltro || 'Selecciona una actividad'}
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
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    !actividadFiltro && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setActividadFiltro('');
                    setShowActividadDropdown(false);
                    setActividadSearch('');
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      !actividadFiltro && styles.dropdownItemTextActive,
                    ]}
                  >
                    Todas las actividades
                  </Text>
                </TouchableOpacity>
                {actividadesFiltradas.map((actividad) => (
                  <TouchableOpacity
                    key={actividad.id_actividad}
                    style={[
                      styles.dropdownItem,
                      actividadFiltro === actividad.nombre_actividad &&
                        styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setActividadFiltro(actividad.nombre_actividad);
                      setShowActividadDropdown(false);
                      setActividadSearch('');
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        actividadFiltro === actividad.nombre_actividad &&
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

        {/* Filtro por Fecha */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Fecha:</Text>
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
              {fecha && (
                <TouchableOpacity
                  onPress={() => setFecha(null)}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setMostrarDatePicker(true)}
                style={styles.dateButton}
              >
                <Ionicons name="calendar-outline" size={20} color={COLORS.primaryBlue} />
                <Text style={styles.dateButtonText}>
                  {fecha ? formatDate(fecha) : 'Selecciona una fecha'}
                </Text>
                {fecha && (
                  <TouchableOpacity
                    onPress={() => setFecha(null)}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {mostrarDatePicker && (
                <DateTimePicker
                  value={fecha || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') {
                      setMostrarDatePicker(false);
                    }
                    if (selectedDate) {
                      setFecha(adjustDate(selectedDate));
                      if (Platform.OS === 'ios') {
                        setMostrarDatePicker(false);
                      }
                    } else if (Platform.OS === 'android') {
                      setMostrarDatePicker(false);
                    }
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Filtro por Zona - Dropdown con búsqueda */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Zona:</Text>
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
              {zona || 'Selecciona una zona'}
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
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    !zona && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setZona('');
                    setShowZonaDropdown(false);
                    setZonaSearch('');
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      !zona && styles.dropdownItemTextActive,
                    ]}
                  >
                    Todas las zonas
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

        {/* Botón Aplicar Filtros */}
        <TouchableOpacity style={styles.applyButton} onPress={aplicarFiltros}>
          <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
        </TouchableOpacity>
        </View>
      )}

      {/* Lista de Publicaciones */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && publicaciones.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Cargando publicaciones...</Text>
          </View>
        ) : publicacionesFiltradas.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay publicaciones disponibles</Text>
            <Text style={styles.emptySubtext}>
              Intenta ajustar los filtros o crea una nueva publicación
            </Text>
          </View>
        ) : (
          publicacionesFiltradas.map((publicacion) => (
            <TouchableOpacity
              key={publicacion.id_publicacion}
              onPress={() => {
                navigation.navigate('PublicationDetail', { 
                  publicationId: publicacion.id_publicacion,
                  publication: publicacion
                });
              }}
            >
              <View style={styles.card}>
                {/* Badge de tipo de actividad en la esquina superior derecha */}
                {publicacion.actividad_tipo ? (
                  <View style={styles.activityTypeBadge}>
                    <Text style={styles.activityTypeText}>
                      {publicacion.actividad_tipo}
                    </Text>
                  </View>
                ) : (
                  // Badge temporal para debug (solo en desarrollo)
                  __DEV__ && (
                    <View style={[styles.activityTypeBadge, { backgroundColor: '#FF0000' }]}>
                      <Text style={styles.activityTypeText}>NO TIPO</Text>
                    </View>
                  )
                )}
                
                <Image
                  source={{
                    uri: getImageWithFallback(
                      publicacion.actividad_imagen,
                      publicacion.usuario_foto,
                      'https://via.placeholder.com/75'
                    ),
                  }}
                  style={styles.avatar}
                  defaultSource={require('../assets/images/logo.png')}
                />

                <View style={styles.cardContent}>
                  <Text style={styles.userName} numberOfLines={2} ellipsizeMode="tail">
                    {publicacion.titulo}
                  </Text>
                  <Text style={styles.eventTitle}>
                    {publicacion.nombre_actividad || 'Sin actividad'}
                  </Text>
                  <Text style={styles.eventLocation}>
                    {publicacion.direccion || 'Sin dirección'}
                  </Text>
                  <Text style={styles.eventUser}>
                    Por: {publicacion.usuario_nombre || 'Usuario desconocido'}
                  </Text>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.primaryBlue} />
                      <Text style={styles.infoText}>
                        {formatDateDisplay(publicacion.fecha)}
                      </Text>
                    </View>
                    {publicacion.hora && (
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.primaryBlue} />
                        <Text style={styles.infoText}>{formatTime(publicacion.hora)}</Text>
                      </View>
                    )}
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={16} color={COLORS.primaryBlue} />
                      <Text style={styles.infoText}>
                        {publicacion.vacantes_disponibles !== undefined && 
                         publicacion.vacantes_disponibles !== null && 
                         publicacion.vacantes_disponibles > 0
                          ? publicacion.vacantes_disponibles === 1
                            ? '1 vacante disponible'
                            : `${publicacion.vacantes_disponibles} vacantes disponibles`
                          : 'Sin vacantes disponibles'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Footer de Navegación */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Home')}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.margin,
    color: COLORS.primaryBlue,
    paddingHorizontal: SIZES.padding,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding * 2,
    marginBottom: SIZES.margin,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding,
    minHeight: 50,
  },
  filterToggleButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
    marginLeft: SIZES.margin / 2,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
  },
  clearFiltersText: {
    color: COLORS.primaryBlue,
    fontSize: SIZES.medium,
    fontWeight: '500',
    marginLeft: SIZES.margin / 2,
  },
  filtrosContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SIZES.margin,
  },
  filterRow: {
    marginBottom: SIZES.margin,
  },
  filterLabel: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SIZES.margin / 2,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterChip: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding / 2,
    borderRadius: 20,
    backgroundColor: COLORS.inputBackground,
    marginRight: SIZES.margin / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  filterChipText: {
    fontSize: SIZES.small,
    color: COLORS.textDark,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    // Los estilos se aplican directamente en el componente WebDateInput
  },
  clearButton: {
    marginLeft: SIZES.margin / 2,
  },
  applyButton: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    paddingVertical: SIZES.padding,
    alignItems: 'center',
    marginTop: SIZES.margin / 2,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.medium,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 100, // Espacio para el footer
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.margin * 4,
  },
  loadingText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: SIZES.large,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin / 2,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding * 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  activityTypeBadge: {
    position: 'absolute',
    top: SIZES.padding / 2,
    right: SIZES.padding / 2,
    backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: SIZES.padding * 0.75,
    paddingVertical: SIZES.padding / 4,
    borderRadius: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activityTypeText: {
    color: '#FFFFFF',
    fontSize: SIZES.small - 1,
    fontWeight: '600',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    marginRight: SIZES.margin,
    backgroundColor: COLORS.inputBackground,
  },
  cardContent: {
    flex: 1,
    paddingRight: 80, // Espacio para el badge del tipo de actividad
  },
  userName: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: SIZES.large,
    color: COLORS.primaryBlue,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  eventUser: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin / 2,
    fontStyle: 'italic',
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.margin / 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.margin,
    marginBottom: 4,
  },
  infoText: {
    fontSize: SIZES.medium,
    color: COLORS.textDark,
    marginLeft: 4,
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
});

export default PublicationsScreen;

