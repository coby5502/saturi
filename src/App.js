import React, { useState } from "react";
import { Grommet, Box, Heading, Button, Text, TextArea } from 'grommet';

const App = () => {
  
  const [slang, setSlang] = useState("");
  const [standard, setStandard] = useState("번역하기 버튼을 누르면, 표준어로 번역됩니다.");

  const getStandard = () => {
    const url = 'http://localhost:8009/text_only_test/' + slang
    setStandard("번역 중입니다. 잠시만 기다려주세요.")

    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
        "Access-Control-Allow-Origin": "*"
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.text2);
        setStandard(data.text2)
      });
  }

  return (
    <Grommet theme={theme}>
      <Box align="center">
        <Box gap="medium" alignSelf="center" width="large" pad="medium">
          <Heading>Saturi</Heading>
          <ColorBox background="dark-1">
            <TextArea
              placeholder="번역할 사투리를 입력해주세요."
              value={slang}
              onChange={event => setSlang(event.target.value)}
            />
          </ColorBox>
          <ColorBox background="light-1">
            <Text color="my-text-color">{standard}</Text>
          </ColorBox>
          <Button onClick={getStandard} label={"번역하기"} />
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
