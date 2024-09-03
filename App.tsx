import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import ImagePicker, {ImageOrVideo} from 'react-native-image-crop-picker';
import {
  Camera,
  CameraPermissionRequestResult,
  useCameraDevices,
} from 'react-native-vision-camera';
import {Capture} from './assets/icons';
import {interpretImage} from './api/interpret';

export const App: React.FC = () => {
  const [processedText, setProcessedText] = React.useState<string>(
    'Scan a Card to see\nContact info here',
  );
  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  let device: any = devices.back;
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [isProcessingText, setIsProcessingText] = useState<boolean>(false);
  const [cardIsFound, setCardIsFound] = useState<boolean>(false);
  const [contactInfo, setContactInfo] = useState<object>({});

  const validateCard: (result: object) => void = result => {
    const keys = Object.keys(result);

    if (keys?.length) {
      setContactInfo(result);
      setCardIsFound(true);
    } else {
      setProcessedText('No valid Business Card found, please try again!!');
      setCardIsFound(false);
    }
  };

  const pickAndRecognize: () => void = useCallback(async () => {
    ImagePicker.openPicker({
      cropping: false,
    })
      .then(async (res: ImageOrVideo) => {
        setIsProcessingText(true);
        const result = await interpretImage(res);
        setIsProcessingText(false);
        validateCard(result?.data ?? {});
      })
      .catch(err => {
        console.log('err:', err);
        setIsProcessingText(false);
      });
  }, []);

  const captureAndRecognize = useCallback(async () => {
    try {
      setIsProcessingText(true);
      const image = await camera.current?.takePhoto({
        qualityPrioritization: 'quality',
        enableAutoStabilization: true,
        flash: 'on',
        skipMetadata: true,
      });
      const imagePath =
        Platform.OS === 'ios' ? image?.path : `file://${image?.path}`;
      const result = await interpretImage({
        ...image,
        path: imagePath,
      });
      setIsProcessingText(false);
      validateCard(result?.data ?? {});
    } catch (err) {
      console.log('err:', err);
      setIsProcessingText(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const cameraPermission: CameraPermissionRequestResult =
        await Camera.requestCameraPermission();
      const microPhonePermission: CameraPermissionRequestResult =
        await Camera.requestMicrophonePermission();
      if (cameraPermission === 'denied' || microPhonePermission === 'denied') {
        Alert.alert(
          'Allow Permissions',
          'Please allow camera and microphone permission to access camera features',
          [
            {
              text: 'Go to Settings',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Cancel',
            },
          ],
        );
        setHasPermissions(false);
      } else {
        setHasPermissions(true);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <Text style={styles.title}>Business Card Scanner</Text>
      <Pressable style={styles.galleryBtn} onPress={pickAndRecognize}>
        <Text style={styles.btnText}>Pick from Gallery</Text>
      </Pressable>
      {device && hasPermissions ? (
        <View>
          <Camera
            photo
            enableHighQualityPhotos
            ref={camera}
            style={styles.camera}
            isActive={true}
            device={device}
          />
          <Pressable
            style={styles.captureBtnContainer}
            onPress={captureAndRecognize}>
            <Image source={Capture} />
          </Pressable>
        </View>
      ) : (
        <Text>No Camera Found</Text>
      )}
      {isProcessingText ? (
        <ActivityIndicator
          size={'large'}
          style={styles.activityIndicator}
          color={'blue'}
        />
      ) : cardIsFound ? (
        <ScrollView
          style={styles.infoWrapper}
          contentContainerStyle={styles.infoContainer}>
          {Object.keys(contactInfo).map((key, index) => (
            <View style={styles.contactRow} key={`contact-row-${index}`}>
              <Text style={styles.contactRowKey}>{key}:</Text>
              {(contactInfo as any)[key]?.length ? (
                (contactInfo as any)[key].map((row: string, id: number) => (
                  <Text key={`contact-row${id}`} style={styles.contactRowValue}>
                    {row}
                  </Text>
                ))
              ) : (
                <Text style={styles.contactRowValue}>Undefined</Text>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.errorText}>{processedText}</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  infoWrapper: {
    width: '100%',
  },
  infoContainer: {
    paddingBottom: 20,
  },
  camera: {
    marginVertical: 24,
    height: 240,
    width: 360,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    letterSpacing: 0.6,
    marginTop: 18,
  },
  galleryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#000',
    borderRadius: 40,
    marginTop: 18,
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  errorText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'purple',
    textAlign: 'center',
    alignSelf: 'center',
  },
  captureBtnContainer: {
    position: 'absolute',
    bottom: 28,
    right: 10,
    zIndex: 20,
  },
  activityIndicator: {
    marginTop: 34,
  },
  contactRowKey: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'red',
    textTransform: 'uppercase',
  },
  contactRowValue: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'blue',
    width: '100%',
  },
  contactRow: {
    marginTop: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
});
