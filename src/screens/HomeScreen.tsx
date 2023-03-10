import { View, Text, Button, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import useAuth from '@hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Entypo, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import CardsSwipe from 'react-native-cards-swipe';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import SQLite from 'react-native-sqlite-storage';
import Swiper from '@/common/components/elements/Swiper';

const db = [
  {
    name: 'Richard Hendricks',
    img: require('@assets/icon.png')
  },
  {
    name: 'Erlich Bachman',
    img: require('@assets/icon.png')
  },
  {
    name: 'Monica Hall',
    img: require('@assets/icon.png')
  },
  {
    name: 'Jared Dunn',
    img: require('@assets/icon.png')
  },
  {
    name: 'Dinesh Chugtai',
    img: require('@assets/icon.png')
  }
]

const alreadyRemoved: string[] = []
let charactersState = db // This fixes issues with updating characters state forcing it to use the current state and not the state that was active when the card was created.


const HomeScreen = () => {

  const [characters, setCharacters] = useState(db)
  const [lastDirection, setLastDirection] = useState()

  const childRefs = useMemo(() => Array(db.length).fill(0).map(i => React.createRef()), [])


  const [sound, setSound] = React.useState<Audio.Sound | null>(null);

  const navigation = useNavigation();
  const { logout, spotify, user } = useAuth();
  const [userImage, setUserImage] = React.useState<string | null>(null);
  //const [tracks, setTracks] = React.useState<any[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [recentlyPlayedTracks, setRecentlyPlayedTracks] = React.useState<{}>({});
  var tracks: any | any[] = [];

  const swiped = (direction: string | React.SetStateAction<undefined>, nameToDelete: string) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction)
    setLastDirection(direction)
    alreadyRemoved.push(nameToDelete)
  }

  const outOfFrame = (name: string) => {
    console.log(name + ' left the screen!')
    charactersState = charactersState.filter(character => character.name !== name)
    setCharacters(charactersState)
  }

  const swipe = (dir: string) => {
    const cardsLeft = characters.filter(person => !alreadyRemoved.includes(person.name))
    if (cardsLeft.length) {
      const toBeRemoved = cardsLeft[cardsLeft.length - 1].name // Find the card object to be removed
      const index = db.map(person => person.name).indexOf(toBeRemoved) // Find the index of which to make the reference to
      alreadyRemoved.push(toBeRemoved) // Make sure the next card gets removed next time if this card do not have time to exit the screen
      childRefs[index].current.swipe(dir) // Swipe the card!
    }
  }

  const cardsData = [
    { src: require('@assets/icon.png') },
    { src: require('@assets/icon.png') },
    { src: require('@assets/icon.png') },
    { src: require('@assets/icon.png') },
  ];

  // spotify.searchTracks('Paramore').then(
  //   function (data) {
  //     setTracks(data.tracks.items);
  //   },
  //   function (err) {
  //     console.error(err);
  //   }
  // );

  async function getRecentlyPlayedTracks() {
    const recentlyPlayed = await spotify.getMyRecentlyPlayedTracks({ limit: 15 }).then(
      function (data: { items: any[]; }) {
        console.log("Here are your 15 recently played tracks: \n");

        data.items.forEach((element: { track: { name: any; }; }) => {
          console.log(element.track.name);
        });

        var recentlyPlayedTracks = data.items;

        //setTracks(recentlyPlayedTracks);
        tracks = recentlyPlayedTracks;
        setLoaded(true);
        console.log("Data Items Tracks: \n");
        //console.log(data.items.map((item: { track: any; }) => item.track));
        //console.log(tracks);

        // loop through tracks
        // for (var i = 0; i < tracks.length; i++) {
        //   console.log(tracks[i].name);
        // } 





      }
    )
  }

  async function getTracks() {
    if (loaded) {
      return;
    }

    const topArtistsIds = await spotify.getMyTopArtists({ limit: 5 }).then(
      function (data: { items: any[]; }) {
        return data.items.map((artist: any) => artist.id);
      },
      function (err: any) {
        console.error(err);
      }
    ) as string[];

    spotify.getRecommendations({
      seed_artists: topArtistsIds,
      limit: 100,
    }).then(
      function (data: { tracks: React.SetStateAction<any[]>; }) {
        setTracks(data.tracks);
        setLoaded(true);
        console.log(data.tracks);
      },
      function (err: any) {
        console.error(err);
      }
    );
  }


  React.useEffect(() => {
    //getTracks();
  }, [user, spotify]);

  React.useEffect(() => {
    getRecentlyPlayedTracks();
  }, [user, spotify]);

  async function playPreview(this: any, cardIndex: number) {
    const currentTrack = tracks[cardIndex];

    if (currentTrack.preview_url === null) {
      return;
    }

    if (this.sound) {
      await this.sound.unloadAsync().catch((error: any) => console.log(error));
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: currentTrack.preview_url },
      { shouldPlay: true }
    );
    if (sound) {
      setSound(sound);
      await sound.playAsync().catch((error) => console.log(error));
    }
  }

  React.useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync().catch((error) => console.log(error));
      }
      : undefined;
  }, [sound]);



  React.useEffect(() => {
    if (user) {
      if (user.images) {
        if (user.images.length > 0) {
          setUserImage(user.images[0].url)
        }
      }
    }
  }, [user]);



  return (
    <SafeAreaView className='flex-1'>
      {/* <ImageBackground source={require('@assets/Swipe_Concept_v2.png')} className='flex-1'> */}

      <View className='items-center relative'>
        <TouchableOpacity className='absolute left-5 top-3' onPress={
          () => {
            navigation.navigate('User')
          }
        }>
          {
            userImage !== null
              ?
              <Image source={{ uri: userImage }} className="w-10 h-10 rounded-full" />
              :
              <View>
                <Image source={require('@assets/blank_user.png')} className="w-10 h-10 rounded-full" />
              </View>
          }
        </TouchableOpacity>
        <TouchableOpacity >
          <Image source={require('@assets/Logo_512.png')} style={{
            width: 128,
            height: 65,
            transform: [{ translateX: -6 }],
            resizeMode: 'contain',
          }} />
        </TouchableOpacity>
      </View>
      <View className='flex-1 items-center justify-center'>
        <View className='h-full px-2 pt-1 pb-12' style={{ aspectRatio: 9 / 16 }}>
          <Swiper tracks={tracks} />
        </View>
      </View>
    </SafeAreaView >
  )
}





export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'green'
  },
  cardsSwipeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 40,
    zIndex: 1,
    elevation: 1,
    backgroundColor: 'yellow',
    height: '100%',
    aspectRatio: 0.75,
  },
  cardContainer: {
    width: '92%',
    height: '100%',
    padding: 2,
  },
  card: {
    aspectRatio: 9 / 16,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 3.3,
    elevation: 6,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  noMoreCard: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: 70,
    padding: 14,
    borderWidth: 3,
    borderRadius: 35,
  },
  rightBtn: {
    borderColor: '#00D400',
  },
  leftBtn: {
    borderColor: '#E60000',
  },
  likeIcon: {
    width: 40,
    height: 40,
    top: -3,
  },
  dislikeIcon: {
    width: 40,
    height: 40,
    top: 3,
  },
  nope: {
    borderWidth: 5,
    borderRadius: 6,
    padding: 8,
    marginRight: 30,
    marginTop: 25,
    borderColor: 'red',
    transform: [{ rotateZ: '22deg' }],
  },
  nopeLabel: {
    fontSize: 32,
    color: 'red',
    fontWeight: 'bold',
  },
  like: {
    borderWidth: 5,
    borderRadius: 6,
    padding: 8,
    marginLeft: 30,
    marginTop: 20,
    borderColor: 'lightgreen',
    transform: [{ rotateZ: '-22deg' }],
  },
  likeLabel: {
    fontSize: 32,
    color: 'lightgreen',
    fontWeight: 'bold',
  },
});