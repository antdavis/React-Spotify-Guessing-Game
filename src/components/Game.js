import React, { useState, useEffect, useReducer } from "react";
import { useHistory } from "react-router";
import { Box, Button, Container, Grid, Typography } from "@material-ui/core";
import _ from "lodash";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";

import Modal from "./Modal";

const Game = ({ numAttempts = 3 }) => {
  // Game state
  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [gameSettings, setGameSettings] = useState([]);
  const [selectedSong, setSelectedSong] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(false);
  const [attempts, setAttempts] = useState(numAttempts);
  const [score, setScore] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [won, setWon] = useState(false);
  const [matches, setMatches] = useState(0); //should be set to NumOfSongs and decremented for every correct match and won set to true at 0
  const [gameOver, setGameOver] = useState(false); //not sure if needs to be state, but gameOver is set to true if the remaining songs from localStorage is less than songs to play game
  const [solution, setSolution] = useState(""); //again this probably doesn't need to be state should probalby just pass in the songs list for the round
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  // const [count, setCount] = useState(0)
  // const [allSongs, setAllSongs] = useState([])
  // const [allArtists, setAllArtists] = useState([])

  // Game logic
  useEffect(() => {
    setTimeout(() => {
      const settings = JSON.parse(localStorage.getItem("gameSettings"));

      setAttempts(settings.numAttempts);
      setGameSettings(settings);
      setShowModal(false);
      // setMatches(settings.numSongs)
      console.log(
        "Page Loading",
        settings,
        settings.numArtists,
        settings.numSongs
      );

      // if (localStorage.getItem("apiResults") !== "null")
      populateSongsArtists(settings.numArtists, settings.numSongs);
      forceUpdate();
    }, 1000);
  }, []);

  const populateSongsArtists = (numArtists, numSongs) => {
    const allArtists = JSON.parse(localStorage.getItem("apiResults")).artists;
    const allSongs = JSON.parse(localStorage.getItem("apiResults")).songs;

    // setAllSongs(allSongs)
    // setAllArtists(allArtists)

    console.log("ASLDKFJSDLKFJ ", allSongs);

    if (artists.length > 0) setArtists([]);
    if (songs.length > 0) setSongs([]);

    console.log(allSongs.length, numSongs);
    if (allSongs.length <= numSongs) {
      setGameOver(true);
      setShowModal(true);
      return;
    }

    while (songs.length < numSongs) {
      songs.push(allSongs.pop());
    }
    console.log("Starting songs ", songs);

    for (let item of songs) {
      artists.push(allArtists.find((e) => e.artistName === item.artistName));
    }
    console.log("starting Artists ", artists);
    while (artists.length < numArtists) {
      let tempArtist =
        allArtists[Math.floor(Math.random() * allArtists.length)];
      console.log("temp is ", tempArtist);
      if (artists.artistName !== tempArtist.artistName)
        artists.push(tempArtist);
    }

    console.log("Finsihed artist ", artists);
    localStorage.setItem(
      "apiResults",
      JSON.stringify({
        songs: allSongs,
        artists: allArtists,
      })
    );

    //shuffle both songs and artists arrays
    setSongs(_.shuffle(songs));
    setArtists(_.shuffle(artists));
  };

  const handleSelectSong = (song) => {
    console.log("Song is ", song, " matching is ", matches);
    setSelectedSong(song);
    if (selectedArtist !== false) {
      if (song.artistName !== selectedArtist.artistName) {
        console.log("FAILLED", " matches is ", matches);
        setAttempts(attempts - 1);
        setSelectedSong(false);
        setSelectedArtist(false);

        if (attempts - 1 === 0) {
          setShowModal(true);
          setIsPlaying(false);
          setShowModal(true)
          if (isPlaying)
            currentAudio.pause();
        }
      }
      if (song.artistName == selectedArtist.artistName) {
        console.log("I'm Here and score is ", score);
        setScore(score + 100);
        setSelectedSong(false);
        setSelectedArtist(false);
        setMatches(matches + 1);

        console.log("Song matches is ", matches, " +1 ", gameSettings.numSongs)
        if ((matches + 1) == gameSettings.numSongs) {
          console.log("Winner")
          setIsPlaying(false);
          if (isPlaying)
            currentAudio.pause();
          setWon(true)
          setShowModal(true)
        }
      }
    }
  };

  const handleSelectArtist = (artist) => {
    console.log("Artist is ", artist);
    setSelectedArtist(artist);

    if (selectedSong !== false) {
      if (selectedSong.artistName !== artist.artistName) {
        setAttempts(attempts - 1);
        setSelectedSong(false);
        setSelectedArtist(false);

        if (attempts - 1 === 0) {
          setShowModal(true);
          setIsPlaying(false);
          if (isPlaying)
            currentAudio.pause();
          setShowModal(true)
        }
      }
      if (selectedSong.artistName == artist.artistName) {
        setScore(score + 100);
        setSelectedSong(false);
        setSelectedArtist(false);


        setMatches(matches + 1)

        console.log("Artist matches is ", matches + 1, " +1 ", gameSettings.numSongs, (matches + 1) == gameSettings.numSongs)
        if ((matches + 1) == gameSettings.numSongs) {
          console.log("Winner")
          setIsPlaying(false);
          if (isPlaying)
            currentAudio.pause();
          setWon(true)
          setShowModal(true)

        }
      }
    }
  };

  const handlePlayPause = (song) => {
    if (currentAudio !== null) {
      if (!currentAudio.paused && currentAudio.src === song.previewURL) {
        currentAudio.pause();
        setIsPlaying(false); // pause current song if it's playing and the same song is clicked again
        return;
      } else {
        currentAudio.pause();
        setIsPlaying(false); // pause current song if a different song is clicked
      }
    }
    const audio = new Audio(song.previewURL);
    setCurrentAudio(audio);
    audio.play();
    setIsPlaying(true);
  };

  function HeartRow({ attempts }) {
    const maxHearts = 5;
    const numHearts = Math.min(attempts, maxHearts);
    const hearts = [];

    for (let i = 0; i < numHearts; i++) {
      hearts.push(<FavoriteIcon key={i} color="secondary" />);
    }

    return <div>{hearts}</div>;
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ height: "100%", padding: 0, overflow: "hidden" }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          marginTop: "5rem",
          overflow: "hidden",
        }}
      >
        <Typography variant="h2" gutterBottom>
          {gameSettings.selectedGenre} Music Game
        </Typography>
        <Typography variant="h4" gutterBottom>
          Current Score: {score}
        </Typography>
        <Typography variant="h5" gutterBottom>
          Attempts: <HeartRow attempts={attempts} />
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" gutterBottom>
              Songs
            </Typography>
            <div>
              {songs &&
                [...songs].map((song) => (
                  <div key={song.trackName}>
                    <Button
                      style={{ fontSize: "20px" }}
                      onClick={() => handleSelectSong(song)}
                    >
                      <p>{song.trackName}</p>
                    </Button>
                    {isPlaying && currentAudio.src === song.previewURL ? (
                      <Button
                        onClick={() => {
                          handlePlayPause(song);
                        }}
                      >
                        <PauseIcon />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handlePlayPause(song);
                        }}
                      >
                        <PlayArrowIcon />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" gutterBottom>
              Artists
            </Typography>
            <div>
              {artists &&
                _.chunk([...artists], 2).map((chunk, index) => (
                  <Grid key={index} container spacing={2}>
                    {chunk.map((artist) => (
                      <Grid key={artist.artistName} item xs={12} sm={6}>
                        <Button
                          style={{ fontSize: "18px" }}
                          onClick={() => handleSelectArtist(artist)}
                        >
                          <div>
                            <img
                              style={{ width: "150px", height: "150px" }}
                              onClick={() => handleSelectArtist(artist)}
                              src={artist.artistImg}
                              alt={artist.artistName}
                            />
                            <p>{artist.artistName}</p>
                          </div>
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                ))}
            </div>
          </Grid>
        </Grid>
        {showModal && (
          < Modal
            won={won}
            attempts={attempts}
            solution={solution}
            score={score}
            gameOver={gameOver}
            onClose={() => {
              setShowModal(false);
              window.location.reload(false);
            }}
          />
        )}
      </Box>
    </Container>
  );
};

export default Game;
