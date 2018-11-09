/*
Copyright 2018 Jan Engehausen, smurf667@gmail.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {Game} from "../dist/Game.js";
import {Level} from "../dist/Level.js";

const game = new Game(window);
const levels = [];

levels.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAABjCAYAAACSRYAOAAAA+0lEQVRYhe3WzQ6DIAwA4BqNXARF/Dmp0fd/x+40RxArsCVuSw9cRL+W0oCQZRm+M4CaFEKgECINKMsSAQABAIuiYMABuq7bnyUBTdPcDIzj+AK01qi1xr7v04o4TROu64pt26YBeZ7jPM/pwLIsuG1bOmCMQWMMDsPw2UaqqmoHpJRxgB39KgsGvhawe+CqFw6ALzqVxT8CvgJShYTQ6GdZMMDAAaC68KwbISa6LwsGGGCAgSBAKYV1XYcB7nGmlNpfchH7WIOz6HYUap4BaxeoSlM7RPaBlNJ7W/1QKzPAAAMM3AOE/Oo/x+FujPnYRSAmdd9SGGDgT4AHo+BEXH+fSrYAAAAASUVORK5CYII=");
levels.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAABACAYAAAATffeWAAABGElEQVRYhe3Xyw6EIAwF0DZBceFj4+P/v5RZTFAorbZkMpmMLth5DyhUABAxpK1t2wAARXPOBfosIgb4OND3fREex5ENF4A1nAHWof8gUPP+O1Db+wPcAxiGQQcgYpimqQrJyrkGKX4oVqQArAgLWBARkGaGTu8DPIAJ6LpuX53palQDsVeKmIEUcc7JAC2odNhxG7wEOCTdQ1XA1Wz8M+C9D9579uABcBw+WEAK0TALnA2ZhlngrHfuzATa3qUD1+VJ9SycAdpwnJ3YwBJmX1H750mBeZ7Dsizv52jFaYBt28K6rgcgIXQjZUcr1b6ENE2TNdU6UJ9QLB/0u4D60sUB6ksXB6hvLFw9aMJiMWnDO3C2jd0AeAG6BxJFwpUEFgAAAABJRU5ErkJggg==");
levels.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAACnCAYAAAD+FRfoAAABtUlEQVRoge3aXa+CMAwGYOrYBsOPGG/VKPz/39hzBeF4nOu2ak7Me9EYE3guLK2jW0NErB0N0M+g3vtoFKHOOW6aJhpt2wIFChQoUKBAgQL9enS32+mjEvjpovdwOFTB0eW5BI79vi/X/Cm4CC19EoACBQoUKFCgQN+HEhFba6MRu6c5Ho+sHc1ms2HtAAoUqCp6Op1YO5JdqmQf5UuaNFCgQIE+i9gUrQqNwckmXTKeE23F547nRGhuwoACBQq0GH3sqeJTSKn2t4azjjZJ4ezzUpKGnY1KkiZ6kahGnXN8v9+X79M08TAM9ej1emUi4tvtxm3b8vl8Xp7FKtR7v2DVKBFx3/c8juMyJpqmqR59S/ZDCHy5XJZQSZQxhruuY2st933Pxpj6RBljeBgG9t5zCKEenRNljFmi6zqdiooNCqsrak6YWkXNn9ZavYoKIfA4jkxEuhW1bir/s6I+jm63W100BWajEjALlYL7/Z6JBH/RuWASLQFfoqVgFK0Bn6K14B9UA/yFaoELKhkWSMEsdA2+mv5672XoGnTOpQfdEnT9ogA0is1LJVV0vg4oUKBA1dAfa9Lvc64VAFoAAAAASUVORK5CYII=");
levels.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAADpCAYAAAAkhRfKAAACYUlEQVR4nO3bya7CMAwF0Ar/AFBGKcwU/v8L81aVoE3i6yTiMdxFdujITRPbLWkjIl4bh8MhOEK/bTRsv9/7pmmCwzlHkCBBguPRdZ0dFBF/v9/hKCEwhWaDMbQIDM3ncB6LwWGUBAn+JvjYFF2vVzWNJcEe6LpuhN1ut6dk0UcZBWPR9NhwCpJgKkv3WDXw8QYQLAcfV0IxOFxW2WBskSd3SgpMrcticIgVgSEsG4xhxXu5ChjqCQkSJEjwA8DQE6gKitieQCEwhaaiTII5cwl1sFXA3EKV1RKbb0r1MpobXRAsiS4IlkQ3AkujG4Gx6FDsCSzJMAQJvgLUCpMZtKBPWy9V6VB0lG1K0WCC1dCsuvzSQp8NIu+6CH46iLyAhMFUwU+hRa9Z4L+QhtEtFgs/m838crlUo4R6m/V67du29avVSr10uLdBL53gu4Op3XE8Hv3pdFJ3DVyXnXNQd/G/oIj43W4XHFmXLKIfRPmyOTSBqQnvJ90Mxia8n/Qvm0OCBAkSJEiQIME3Bi+Xiz+fz/VAbQT7Q+0lWmwkj3ZYUehoB4rCRzsQ1HS0A11GBAkaQdPbOTRZmM9jI1tweOlJEEHNoPXmECRI8DNB86cQ1rxYBXxEVVAE73WccxiIoiYQQc0gsoQIEiRI8BdA7X97E6hhJhDB+ufnKmVU/ZzEAkLvHGJg6HhCUW8znU79ZDLx8/n8TcHtduvbtvWbzaYOGFt7PwZmfcxrOU9XrT80dbAoas6HGpoFaqehvyRjo88qVUG4BCCgqQRooLkEaKA5ORAk+LWgiH6AzAyi4/3BPwE/SURc2EfHAAAAAElFTkSuQmCC");
levels.push("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAABpCAYAAADPy4iiAAAB90lEQVRoge3YyXKDMAwAUISyXLIQwnKB4MT//43qiRmKjVe5TVofNNNpDm8sCVt2AQA0x/F4VGL5e2gU8x+Hw4GKolBit9tlJCMZ+UkEAGi/3ysRCyhIqlCQpmnodrtpo21bHqSqKirLUht1XWfk+z/6vqf7/a6Nrus+qLvm0J2SoaelFtn6+kN3gYz8EeR8PvO08PV6ZVvNJsKZsiSIEIKez2daZBgGejweH4KYOswZiekwLyR0NazIFsSO6NL2TxGXDtMhUkp6vV7uSEwreyE2iA0B0E/9LpN/8NzlMyIFIeuuY03X30dsg0Vw4dctbVpNMOKTMjbElLKo+4lryqIQ15S9PwIATnsYy53Rto9FIy4p+0xE972w1MT2vbAgtpQlQdYpY3v2MKXMigghaBxHJZY3KVvKrIiUkqZpUmI5vNlSxvpKtJUyVmQrZV6Irj7L2pxOp3hEV5+5NutVXC4X/ppEdVdGkiAA20fx7z7Z+obpeTfJVr+uTUbSIvMmudwYWREhBCEiTdNEiPgNMl2/vZD5zaQsS+X9xBTvh0gpCRFpHEdCROWcB9AP396Fnw8uHcBy/Pq2chKE5Yz3WcWPnfFN01DbtmmRqqqoruu0SN/31HVdOiTPwhnJSEZW4Xp/j0KGYSBEVMI0PLwn4voSsQ7dRegLdlaDcwEDizUAAAAASUVORK5CYII=");
const levelData = levels.map( (url) => {
  const data = document.createElement("img");
  data.src = url;
  return data;
});
const play = document.getElementById("play");
const editor = document.getElementById("editor");
game.init(levelData).then(() => {
  if (play) {
    play.onclick = () => {
      play.onclick = '';
      game.intro();
    }
  }
  if (editor) {
    editor.onclick = () => game.showEditor();
  }
});
