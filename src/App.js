import React, { useState } from "react";
import { Grommet, Box, Heading, Button, Text } from 'grommet';

const App = () => {
  const [stream, setStream] = useState();
  const [media, setMedia] = useState();
  const [onRec, setOnRec] = useState(true);
  const [source, setSource] = useState();
  const [analyser, setAnalyser] = useState();
  const [audioUrl, setAudioUrl] = useState();
  
  const [slang, setSlang] = useState("녹음 버튼을 눌러 사투리를 녹음해주세요.");
  const [standard, setStandard] = useState("결과 확인 버튼을 누르면, 표준어로 번역됩니다.");

  const onRecAudio = () => {
    // 음원정보를 담은 노드를 생성하거나 음원을 실행또는 디코딩 시키는 일을 한다
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // 자바스크립트를 통해 음원의 진행상태에 직접접근에 사용된다.
    const analyser = audioCtx.createScriptProcessor(0, 1, 1);
    setAnalyser(analyser);

    setSlang("녹음 버튼을 눌러 사투리를 녹음해주세요.");
    setStandard("결과 확인 버튼을 누르면, 표준어로 번역됩니다.");

    function makeSound(stream) {
      // 내 컴퓨터의 마이크나 다른 소스를 통해 발생한 오디오 스트림의 정보를 보여준다.
      const source = audioCtx.createMediaStreamSource(stream);
      setSource(source);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    // 마이크 사용 권한 획득
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      setStream(stream);
      setMedia(mediaRecorder);
      makeSound(stream);

      analyser.onaudioprocess = function (e) {
        // 3분(180초) 지나면 자동으로 음성 저장 및 녹음 중지
        if (e.playbackTime > 180) {
          stream.getAudioTracks().forEach(function (track) {
            track.stop();
          });
          mediaRecorder.stop();
          // 메서드가 호출 된 노드 연결 해제
          analyser.disconnect();
          audioCtx.createMediaStreamSource(stream).disconnect();

          mediaRecorder.ondataavailable = function (e) {
            setAudioUrl(e.data);
            setOnRec(true);
          };
        } else {
          setOnRec(false);
        }
      };
    });
  };

  // 사용자가 음성 녹음을 중지했을 때
  const offRecAudio = () => {
    // dataavailable 이벤트로 Blob 데이터에 대한 응답을 받을 수 있음
    media.ondataavailable = function (e) {
      setAudioUrl(e.data);
      setOnRec(true);

      onSubmitAudioFile()
    };

    // 모든 트랙에서 stop()을 호출해 오디오 스트림을 정지
    stream.getAudioTracks().forEach(function (track) {
      track.stop();
    });

    // 미디어 캡처 중지
    media.stop();
    // 메서드가 호출 된 노드 연결 해제
    analyser.disconnect();
    source.disconnect();
  };

  const onSubmitAudioFile = () => {
    const url = 'http://164.125.252.182:8009/file_upload'
    const formData = new FormData()

    formData.append('file', {
      uri: audioUrl,
      type: 'wav',
      name: 'file.wav'
    })

    const options = {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        "Access-Control-Allow-Origin": "*"
      },
    };

    fetch(url, options)
      .then((response) => {
        const data = response.json();
        console.log(data)
        setSlang(data.text)
        setStandard(data.text2)
      });
  }

  return (
    <Grommet theme={theme}>
      <Box align="center">
        <Box gap="medium" alignSelf="center" width="large" pad="medium">
          <Heading>Saturi</Heading>
          <ColorBox background="dark-1">
            <Text color="my-text-color">{slang}</Text>
          </ColorBox>
          <ColorBox background="light-1">
            <Text color="my-text-color">{standard}</Text>
          </ColorBox>
          <Button onClick={onRec ? onRecAudio : offRecAudio} label={onRec ? "녹음" : "중단"} />
        </Box>
      </Box>
    </Grommet>
  );
};

const ColorBox = props => (
  <Box
    direction="row"
    margin="small"
    round="small"
    pad="small"
    align="start"
    gap="small"
    {...props}
  />
);

const theme = {
  global: {
    font: {
      family: 'Roboto',
      size: '18px',
      height: '20px',
    },
  },
};

export default App;
