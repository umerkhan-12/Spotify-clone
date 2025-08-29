let currentSong = new Audio()
let songs;
let currFolder;
function formatTime(seconds) {

    if(isNaN(seconds)||seconds<0){
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
// async function getSongs(folder) {

//     currFolder=folder
//     let a = await fetch(`/${folder}/`)
//     let response = await a.text()
//     console.log(response);
//     let div = document.createElement("div")
//     div.innerHTML = response;
//     let as = div.getElementsByTagName("a")
//      songs = [];
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1])
//         }
//     }


//     let songUl = document.querySelector(".songLists").getElementsByTagName("ul")[0]
//     songUl.innerHTML="";
//     // print in library
//     for (const song of songs) {
//         songUl.innerHTML = songUl.innerHTML + `<li> 
//         <img class="invert" src="music.svg" alt="">
//                             <div class="info">
//                                 <div>${song.replaceAll("%20", " ")}</div>
//                                 <div>Artist name</div>
//                             </div>
//                             <div class="playNow">
//                                 <span>Play Now</span>
//                                 <img class="invert" src="play.svg" alt="">
//                             </div>  </li>`
//     }


//     Array.from(document.querySelector(".songLists").getElementsByTagName("li")).forEach(e => {
//         e.addEventListener("click", () => {

//             console.log(e.querySelector(".info").firstElementChild.innerHTML)
//             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
//         })

//     })
//     return songs
// }
async function getSongs(folder) {
  currFolder = folder;

  // 🔹 Fetch info.json for this folder
  let res = await fetch(`/${folder}/info.json`);
  let data = await res.json();
  songs = data.songs;

  let songUl = document.querySelector(".songLists ul");
  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Artist name</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(songUl.getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}


const playMusic = (track, pause = false) => {
   
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {

        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}

 async function displayAlbum(){
    let a = await fetch(`/songs/`)
    let response = await a.text()
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors=div.getElementsByTagName("a");
    let array=Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder=e.href.split("/").slice(-2)[0]

            //Get meta of each folder
            let cardContainer=document.querySelector(".cardContainer")
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()

            cardContainer.innerHTML=cardContainer.innerHTML+=`<div data-folder="${folder}"class="card">
                        <div class="playbutton">
                            <img src="playicon.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //Load the paylist when card is called 
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
         playMusic(songs[0])
        })
     })
 }

async function main() {
    // Get listt of songs

    await getSongs(`songs/${currFolder}`)
    playMusic(songs[0], true)

    //Display all albums on screen

    displayAlbum()
    

    //ATTACH SONGS TO PLAY NEXT PREVIOUS BUTTON

    play.addEventListener("click", () => {
        if (currentSong.paused) {

            currentSong.play()
            play.src = "pause.svg"
        }

        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // AAD EVENT LISTER FOR DURATION
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add event listner to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent=(e.offsetX / e.target.getBoundingClientRect().width) * 100 
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime=((currentSong.duration)*percent)/100;
        
    })

    //Add event listner to hamburger
    
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left="0%";
    })

        //Add event listner to cross
    document.querySelector(".cross").addEventListener("click",()=>{
        document.querySelector(".left").style.left="-100%";
    })

    //Add event listner for next and previous 
    next.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if((index+1)<=songs.length-1){
            playMusic(songs[index+1])
        }
        else{
            playMusic(songs[0])
        }
    })

    //Add event listner for next and previous 
    previous.addEventListener("click",()=>{
        let index=songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })

    //Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100;
        if(currentSong.volume>0){
            document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    // //Load the paylist when card is called 
    // Array.from(document.getElementsByClassName("card")).forEach(e=>{
    //    e.addEventListener("click",async item=>{
    //     songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    //    })
    // })

    //Add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume=0
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume=0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value=0.1;
        }
    })
    
}
main()
