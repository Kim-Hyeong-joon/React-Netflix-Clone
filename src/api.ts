const API_KEY = "5e4908954e6dd8fdaa22e430943eab2c";
const BASE_PATH = "https://api.themoviedb.org/3/";

export function getMovies() {
  return fetch(
    `${BASE_PATH}/movie/now_playing?api_key=${API_KEY}&language=ko`
  ).then((response) => response.json());
}
