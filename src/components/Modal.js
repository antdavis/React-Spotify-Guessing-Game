import { Button, Typography } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.7);
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;
const ModalDiv = styled.div`
  max-width: 500px;
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 10% auto;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
`;
const LostDiv = styled.div``;

const Modal = ({ won, attempts, solution, score, gameOver }) => {
  return (
    <ModalContainer>
      {won && (
        <ModalDiv>
          <Typography variant="h3">You Win!</Typography>
          <Typography variant="h4">Final score:{score}</Typography>
          <Typography variant="h5">The correct answer was</Typography>
          <Typography variant="h5">{solution}</Typography>
          <Typography variant="h6">
            You cleared the round with {attempts} attempts left
          </Typography>
          <div>
            <Button>Try Again</Button>
            <Button>Home</Button>
          </div>
        </ModalDiv>
      )}
      {!won && (
        <ModalDiv>
          <Typography variant="h3" gutterBottom='true'>Do you even listen to music?!</Typography>
          <Typography variant="h4" gutterBottom='true'>Final score:{score}</Typography>
          <Typography variant="h5" color="error">The correct answer was:</Typography>
          <Typography variant="h5" color='primary' gutterBottom='true'>{solution}</Typography>
          <Typography variant="h6" gutterBottom='true'>Give it another try!</Typography>
          <div>
            <Button>Try Again</Button>
            <Button>Home</Button>
          </div>
        </ModalDiv>
      )}
      {gameOver && (
        <ModalDiv>
          <Typography variant="h3">Game Over</Typography>
          <Typography variant="h4">Final score:{score}</Typography>
          <Typography variant="h6">
            Great game! You know you wanna play some more!!
          </Typography>
          <div>
            <Button>Try Again</Button>
            <Button>Home</Button>
          </div>
        </ModalDiv>
      )}
    </ModalContainer>
  );
};

export default Modal;
