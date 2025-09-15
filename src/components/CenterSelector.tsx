import React, { useState, useCallback, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

export interface Coordinate {
    latitude: number
    longitude: number
}

export type CenterSelectorProps = {
    initialCoords?: Coordinate
    value?: Coordinate
    onChange: (coordinate: Coordinate) => void
    userLocation?: boolean
    mapStyle?: string
    initialZoomLevel?: number
    style?: any
    interactive?: boolean
    centerPinStyle?: any;
    renderCenterPin?: () => React.ReactNode
}

const DEFAULT_COORDS: Coordinate = {
    latitude: -23.5505199,
    longitude: -46.6333094
}

export const CenterSelector: React.FC<CenterSelectorProps> = ({
    initialCoords = DEFAULT_COORDS,
    value,
    onChange,
    userLocation = false,
    mapStyle = MapboxGL.StyleURL.Street,
    initialZoomLevel = 10,
    style,
    interactive = true,
    centerPinStyle,
    renderCenterPin,
}) => {
    const [currentCenter, setCurrentCenter] = useState<Coordinate>(value || initialCoords)

    useEffect(() => {
        if (value) {
            setCurrentCenter(value);
        }
    }, [value])

    const handleMapIdle = useCallback(async () => 
        (feature: any) => {
            try {
                const centerCoords = feature?.properties?.center;
                if (!centerCoords) {
                    console.warn("Não foi possível capturar o centro do mapa.")
                    return
                }

                const coordinate: Coordinate = {
                    longitude: centerCoords[0],
                    latitude: centerCoords[1],
                }
                if (
                    coordinate.latitude !== currentCenter.latitude &&
                    coordinate.longitude !== currentCenter.longitude
                ) {
                    setCurrentCenter(coordinate);
                    onChange(coordinate);
                }
            } catch (error) {
                console.warn("Erro ao capturar centro do mapa:", error)
            }
        },
        [currentCenter, onChange]
    );

    const renderDefaultCenterPin = useCallback(() => (
        <View style={styles.centerMarkerModal}>
            <View style={styles.markerContainer}>
                <Image
                    source={require("../assets/pins/defaultPin.png")}
                    style={{ width: 32, height: 32 }}
                />
            </View>
        </View>
    ), [centerPinStyle])
    
    return (
        <View style={[styles.container, style]}>
            <MapboxGL.MapView
                style={styles.map}
                styleURL={mapStyle}
                onMapIdle={handleMapIdle}
                zoomEnabled={interactive}
                scrollEnabled={interactive}
                pitchEnabled={interactive}
                rotateEnabled={interactive}
            >
                <MapboxGL.Camera
                  defaultSettings={{
                    centerCoordinate: [initialCoords.longitude, initialCoords.latitude],
                    zoomLevel: initialZoomLevel
                  }}
                />

                {userLocation && (
                    <MapboxGL.UserLocation 
                        visible={true}
                        showsUserHeadingIndicator={true}
                        onUpdate={(userLocation) => {
                            if (
                                userLocation?.coords &&
                                !initialCoords &&
                                !value
                            ) {
                                const { latitude, longitude } = userLocation.coords
                                const coordinates: Coordinate = { longitude, latitude }
                                setCurrentCenter(coordinates)    
                            }
                        }}
                    />
                )}
            </MapboxGL.MapView>
            <View style={styles.centerPinWrapper}>
                {renderCenterPin ? renderCenterPin() : renderDefaultCenterPin()}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    centerPinWrapper: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -12 }, { translateY: -24 }],
        zIndex: 1
    },
    centerPinContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12, 
    marginTop: -24,  
    zIndex: 1,
  },
  centerMarkerModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
    zIndex: 1,
    alignItems: 'center',
  },
  markerContainer: {
    borderRadius: 20,
    padding: 4,
  },
})