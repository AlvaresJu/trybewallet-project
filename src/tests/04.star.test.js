import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Wallet from '../pages/Wallet';
import { renderWithRouterAndRedux } from './helpers/renderWith';
import { mockData } from './helpers/mockData';

describe('Tests for the save expense feature in the Wallet form', () => {
  const mockValue1 = '715.00';
  const mockValue2 = '90.00';
  const mockcurrency1 = 'ARS';
  const mockcurrency2 = 'EUR';
  const mockTotalExpense1 = 28.31;
  const mockTotalExpense2 = 489.73;
  const mockDescription = 'Despesa teste';

  const valueInputTesid = 'value-input';

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockData),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('if a button with the text "Adicionar despesa" is rendered', async () => {
    renderWithRouterAndRedux(<Wallet />);
    const addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    expect(addBtn).toBeInTheDocument();
  });

  test('if by clicking the button, an API request is made', async () => {
    renderWithRouterAndRedux(<Wallet />);
    const totalCalledTimes = 3;

    expect(global.fetch).toBeCalledTimes(1);

    let addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);

    expect(global.fetch).toBeCalledWith('https://economia.awesomeapi.com.br/json/all');
    expect(global.fetch).toBeCalledTimes(2);

    addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);
    expect(global.fetch).toBeCalledTimes(totalCalledTimes);
  });

  test('if by clicking the button, a new expense is saved in the store', async () => {
    const { store } = renderWithRouterAndRedux(<Wallet />);
    expect(store.getState().wallet.expenses).toHaveLength(0);

    let valueInput = await screen.findByTestId(valueInputTesid);
    userEvent.type(valueInput, mockValue1);
    let addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);
    await screen.findByRole('cell', { name: mockValue1 });
    expect(store.getState().wallet.expenses).toHaveLength(1);
    expect(store.getState().wallet.expenses[0].id).toBe(0);

    valueInput = await screen.findByTestId(valueInputTesid);
    userEvent.type(valueInput, mockValue2);
    addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);
    await screen.findByRole('cell', { name: mockValue2 });
    expect(store.getState().wallet.expenses).toHaveLength(2);
    expect(store.getState().wallet.expenses[1].id).toBe(1);
  });

  test('if by clicking button, the total expense value is properly updated', async () => {
    renderWithRouterAndRedux(<Wallet />);

    const totalExpense = screen.getByTestId('total-field');
    expect(totalExpense).toHaveTextContent(0.00);

    let valueInput = await screen.findByTestId(valueInputTesid);
    userEvent.type(valueInput, mockValue1);
    let currencyInput = await screen.findByTestId('currency-input');
    userEvent.selectOptions(currencyInput, [mockcurrency1]);
    let addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);
    await screen.findByRole('cell', { name: mockValue1 });
    expect(totalExpense).toHaveTextContent(mockTotalExpense1);

    valueInput = await screen.findByTestId(valueInputTesid);
    userEvent.type(valueInput, mockValue2);
    currencyInput = await screen.findByTestId('currency-input');
    userEvent.selectOptions(currencyInput, [mockcurrency2]);
    addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);
    await screen.findByRole('cell', { name: mockValue2 });
    expect(totalExpense).toHaveTextContent(mockTotalExpense2);
  });

  test('if by clicking button, value and description inputs become empty', async () => {
    renderWithRouterAndRedux(<Wallet />);

    let valueInput = await screen.findByTestId(valueInputTesid);
    let descriptionInput = await screen.findByTestId('description-input');
    expect(valueInput.value).toBe('');
    expect(descriptionInput.value).toBe('');

    userEvent.type(valueInput, mockValue1);
    userEvent.type(descriptionInput, mockDescription);
    expect(valueInput.value).toBe(mockValue1);
    expect(descriptionInput.value).toBe(mockDescription);

    const addBtn = await screen.findByRole('button', { name: /adicionar despesa/i });
    userEvent.click(addBtn);
    await screen.findByRole('cell', { name: mockValue1 });

    valueInput = await screen.findByTestId(valueInputTesid);
    descriptionInput = await screen.findByTestId('description-input');
    expect(valueInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
  });
});
