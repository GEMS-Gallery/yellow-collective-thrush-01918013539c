import React, { useState } from 'react';
import { Container, Paper, Grid, Button, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { backend } from 'declarations/backend';

const CalculatorButton = styled(Button)(({ theme }) => ({
  fontSize: '1.5rem',
  padding: theme.spacing(2),
}));

const CalculatorDisplay = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  textAlign: 'right',
  fontSize: '2rem',
  minHeight: '60px',
}));

const App: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const performOperation = async (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      setLoading(true);
      try {
        const result = await backend.calculate(operator, firstOperand, inputValue);
        setDisplay(result.toString());
        setFirstOperand(result);
      } catch (error) {
        setDisplay('Error');
      } finally {
        setLoading(false);
      }
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 2 }}>
        <CalculatorDisplay>
          {loading ? <CircularProgress size={24} /> : display}
        </CalculatorDisplay>
        <Grid container spacing={1}>
          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'].map((btn) => (
            <Grid item xs={3} key={btn}>
              <CalculatorButton
                fullWidth
                variant="contained"
                onClick={() => btn === '.' ? inputDecimal() : inputDigit(btn)}
              >
                {btn}
              </CalculatorButton>
            </Grid>
          ))}
          <Grid item xs={3}>
            <CalculatorButton
              fullWidth
              variant="contained"
              color="secondary"
              onClick={clear}
            >
              C
            </CalculatorButton>
          </Grid>
          {['+', '-', '*', '/'].map((op) => (
            <Grid item xs={3} key={op}>
              <CalculatorButton
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => performOperation(op)}
              >
                {op}
              </CalculatorButton>
            </Grid>
          ))}
          <Grid item xs={3}>
            <CalculatorButton
              fullWidth
              variant="contained"
              color="success"
              onClick={() => performOperation('=')}
            >
              =
            </CalculatorButton>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default App;