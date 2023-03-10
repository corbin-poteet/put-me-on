import { TextInput, View, Text, TouchableOpacity, Image, Alert } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/core';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {push, ref, set, child, update} from 'firebase/database';
import database from "../../firebaseConfig.tsx"; //ignore this error the interpreter is being stupid it works fine

const addPromotion = (artist:string, track:string) => { //This function is unused, but writes data to DB with a simple overwrite, deleting all data in DB and inserting artist and track
  set(ref(database, "ArtistPromos/SampleArtist/"),{
    artistName: artist,
    trackName: track
  });
}

const appendPromotion = (artist:string, track:string) => {
  const updates = { //New data to send to DB
    artistName : artist,
    trackName : track
  };
  const newPostKey = push(child(ref(database), 'ArtistPromos/SampleArtist/')).key; //Generate new key for posting location in DB

  return update(ref(database), updates)
}

const ArtistFormScreen = () => {
    
  const navigation = useNavigation();
  const [artistName, setArtistName] = useState('');
  const [trackName, setTrackName] = useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  return (
    <View className='flex-1 justify-center'>
        <LinearGradient start={{ x: -0.5, y: 0 }} colors={['#014871', '#A0EBCF']} className="flex-1 items-center justify-center">
            <Text className="text-white text-xl px-5 py-2 text-1 font-semibold text-center">Welcome to the artist portal! Enter your song details and submit a payment to promote your song.</Text>
            <TextInput placeholder='Enter Artist Name' onChangeText={setArtistName} className='font-semibold text-1 text-white text-xl flex-row items-center justify-center bg-green-500 rounded-3xl top-5 px-8 py-3'></TextInput>
            <TextInput placeholder='Enter Track Name' onChangeText={setTrackName} className='font-semibold text-1 text-white text-xl flex-row items-center justify-center bg-green-500 rounded-3xl top-10 px-8 py-3'></TextInput>
            <TouchableOpacity onPress={ () => Alert.alert('You have successfully submitted a dummy payment')}>
            <Image source={require('@assets/dummybutton.png')} style={{
                width: 200,
                height: 200,
                resizeMode: 'contain',
                }}
                className="mb-12"
            />
            </TouchableOpacity>
            <TouchableOpacity className='flex-row items-center justify-center bg-green-500 rounded-3xl bottom-12 px-8 py-3' onPress={ () => appendPromotion(artistName, trackName)}><Text className='font-semibold text-1 text-white text-xl'>Submit</Text></TouchableOpacity>
        </LinearGradient>
    </View>
  )
}

export default ArtistFormScreen