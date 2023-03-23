import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { async } from "regenerator-runtime";
import fetchFromSpotify, { request } from "../services/api";

const AUTH_ENDPOINT =
  "https://nuod0t2zoe.execute-api.us-east-2.amazonaws.com/FT-Classroom/spotify-auth-token";
const TOKEN_KEY = "whos-who-access-token";

const Home = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("pop");
  const [songCount, setSongCount] = useState(1);
  const [artistPerChoice, setArtistPerChoice] = useState(2);
  const [authLoading, setAuthLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [token, setToken] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [songs, setSongs] = useState([]);
  const [explicit, setExplicit] = useState(false);
  const [artists, setArtists] = useState([]);
  // const [artImg, setArtImg] = useState('')

  const loadGenres = async (t) => {
    setConfigLoading(true);
    const response = await fetchFromSpotify({
      token: t,
      endpoint: "recommendations/available-genre-seeds",
    });
    // console.log(response)
    setGenres(response.genres);
    setConfigLoading(false);
  };

  const searchGenre = async () => {
    console.log(
      "songs ",
      songCount,
      " numArt ",
      artistPerChoice,
      " genre ",
      selectedGenre
    );
    // const history = useHistory()
    let songsToAdd = [];
    let artistToGetById = [];
    let artistToAdd = [];
    let noPreview = [];
    console.log("token ", token);
    const response = await fetchFromSpotify({
      token: token,
      endpoint: "search",
      params: {
        q:
          "genre%3A" +
          JSON.parse(localStorage.getItem("gameSettings")).selectedGenre,
        type: "artist%2Ctrack",
        market: "US",
        limit: 50,
        offset: 0,
      },
    });

    console.log("response is ", response),
      response.tracks.items.forEach((track) => {
        artistToGetById.push(track.artists[0].id);
        if (!explicit) {
          if (track.preview_url && !track.explicit) {
            songsToAdd.push({
              trackName: track.name,
              artistName: track.artists[0].name,
              previewURL: track.preview_url,
            });
          } else {
            noPreview.push({
              trackName: track.name,
              artistName: track.artists[0].name,
              trackId: track.id,
            });
          }
        } else {
          if (track.preview_url) {
            songsToAdd.push({
              trackName: track.name,
              artistName: track.artists[0].name,
              previewURL: track.preview_url,
            });
          } else {
            noPreview.push({
              trackName: track.name,
              artistName: track.artists[0].name,
              trackId: track.id,
            });
          }
        }
      });

    // console.log("noPreviews ", noPreview)
    // console.log("songsToAdd ", songsToAdd)
    // console.log("artistIds ", artistToGetById)
    response.artists.items.forEach((artist) => {
      artistToGetById = artistToGetById.filter((id) => id !== artist.id);

      artistToAdd.push({
        artistName: artist.name,
        artistImg: artist.images[2].url,
      });
    });

    // console.log("artistIds ", artistToGetById.join(','))
    // setSongs(songsToAdd)
    // setArtists(artistToAdd)

    // console.log("I'm Here ", artistToGetById)
    // console.log("SearchArtID ", artistToGetById.join(','))

    const artistResponse = await fetchFromSpotify({
      token: token,
      endpoint: "artists",
      params: {
        ids: artistToGetById.join(","),
      },
    });

    // console.log("2222response is ", artistResponse)

    artistResponse.artists.forEach((artist) => {
      artistToGetById = artistToGetById.filter((id) => id !== artist.id);

      artistToAdd.push({
        artistName: artist.name,
        artistImg: artist.images[2].url,
      });
    });

    setSongs(songsToAdd);
    setArtists(artistToAdd);

    localStorage.setItem(
      "apiResults",
      JSON.stringify({
        songs: songsToAdd,
        artists: artistToAdd,
      })
    );
  };

  const updateLocalStorageGameSettings = (
    selectedGenre,
    songCount,
    artistPerChoice
  ) => {
    localStorage.setItem(
      "gameSettings",
      JSON.stringify({
        selectedGenre: selectedGenre,
        numSongs: songCount,
        numArtists: artistPerChoice,
        numAttempts: attempts,
        explicit: explicit,
      })
    );
  };

  const randomize = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const randomGame = async () => {
    const numArtist = randomize(2, 4);
    const numSong = randomize(1, 3);
    const attempts = randomize(1, 5);
    const randGenre = genres[Math.floor(Math.random() * genres.length)];

    setArtistPerChoice(numArtist);
    setSongCount(numSong);
    setSelectedGenre(randGenre);
    setAttempts(attempts);

    updateLocalStorageGameSettings(randGenre, numSong, numArtist);
  };

  useEffect(() => {
    setAuthLoading(true);

    const storedTokenString = localStorage.getItem(TOKEN_KEY);
    if (storedTokenString) {
      const storedToken = JSON.parse(storedTokenString);
      if (storedToken.expiration > Date.now()) {
        console.log("Token found in localstorage");
        setAuthLoading(false);
        setToken(storedToken.value);
        loadGenres(storedToken.value);
        return;
      }
    }
    console.log("Sending request to AWS endpoint");
    request(AUTH_ENDPOINT).then(({ access_token, expires_in }) => {
      const newToken = {
        value: access_token,
        expiration: Date.now() + (expires_in - 20) * 1000,
      };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(newToken));
      setAuthLoading(false);
      setToken(newToken.value);
      loadGenres(newToken.value);
    });
  }, []);

  if (authLoading || configLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          my: "20rem",
        }}
      >
        <Typography variant="h2">Spotify Guessing Game</Typography>
        <Typography>To play the game either: </Typography>
        <Typography>
          1. Click 'Start Game' button and play with default options
        </Typography>
        <Typography>2. Change the options for the game first</Typography>

        <FormControl
          variant="outlined"
          margin="dense"
          style={{ marginBottom: 10 }}
        >
          <InputLabel htmlFor="genre-choices">Genre:</InputLabel>
          {/* <input
        type="text"
        list="genre-choices"
        id="genre-choice"
        name="genre-choice"
        placeholder={selectedGenre}
        onClick={event => event.target.value = ""}
        onChange={event => setSelectedGenre(event.target.value)}
      /> */}
          <Select
            native
            id="genre-choices"
            label="Genre"
            value={selectedGenre}
            // defaultValue={genres[Math.floor(Math.random() * genres.length)]}
            onChange={(event) => setSelectedGenre(event.target.value)}
          >
            <option value="" />
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </Select>
          <Button
            onClick={() =>
              setSelectedGenre(
                genres[Math.floor(Math.random() * genres.length)]
              )
            }
          >
            Pick Random Genre
          </Button>
        </FormControl>

        <FormControl
          variant="outlined"
          margin="dense"
          style={{ marginBottom: 10 }}
        >
          <InputLabel htmlFor="number-of-songs">Songs:</InputLabel>
          <Select
            label="Songs"
            id="number-of-songs"
            native
            value={songCount}
            onChange={(event) => setSongCount(event.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          margin="dense"
          style={{ marginBottom: 10 }}
        >
          <InputLabel htmlFor="number-of-artists">Artists:</InputLabel>
          <Select
            native
            label="Artists"
            id="number-of-artists"
            value={artistPerChoice}
            onChange={(event) => setArtistPerChoice(event.target.value)}
          >
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          margin="dense"
          style={{ marginBottom: 10 }}
        >
          <InputLabel htmlFor="number-of-attempts"> Attempts:</InputLabel>
          <Select
            native
            label="Attempts"
            id="number-of-attempts"
            value={attempts}
            onChange={(event) => setAttempts(event.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </Select>
        </FormControl>
        <FormControl
          variant="outlined"
          margin="dense"
          style={{ marginBottom: 10 }}
        >
          <InputLabel htmlFor="allow-explicit-songs">Explicit?:</InputLabel>
          <Select
            native
            label="Explicit?"
            id="allow-explicit-songs"
            value={explicit}
            onChange={(event) => setExplicit(event.target.value)}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormControl>
        <Link to={"/play"}>
          <Button
            size="large"
            onClick={() => {
              updateLocalStorageGameSettings(
                selectedGenre,
                songCount,
                artistPerChoice
              );
              searchGenre();
            }}
          >
            Start Game!
          </Button>

          <Button
            size="large"
            onClick={() => {
              randomGame();
              searchGenre();
            }}
          >
            Random Game
          </Button>
        </Link>
        {console.log(
          "numSong ",
          songCount,
          " numArtist ",
          artistPerChoice,
          " genre ",
          selectedGenre
        )}
      </Box>
    </Container>
  );
};

export default Home;
