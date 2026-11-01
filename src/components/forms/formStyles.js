'use client';

import styled from 'styled-components';
import theme from '@/styles/theme';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

export const Full = styled.div`
  grid-column: 1 / -1;
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${theme.colors.ink};
  .req {
    color: ${theme.colors.sale};
    margin-left: 2px;
  }
  input,
  select,
  textarea {
    width: 100%;
    padding: 11px 14px;
    border-radius: ${theme.radius.sm};
    border: 1px solid ${theme.colors.line};
    background: ${theme.colors.white};
    font-size: 14px;
    font-weight: 400;
    color: ${theme.colors.ink};
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    &::placeholder {
      color: #9aa59d;
    }
    &:focus {
      border-color: ${theme.colors.green};
      box-shadow: 0 0 0 3px rgba(76, 122, 52, 0.12);
    }
  }
  textarea {
    min-height: 96px;
    resize: vertical;
  }
`;

export const CheckLine = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 16px;
  font-size: 13px;
  color: ${theme.colors.muted};
  line-height: 1.55;
  cursor: pointer;
  input {
    accent-color: ${theme.colors.forest};
    width: 16px;
    height: 16px;
    margin-top: 2px;
    flex-shrink: 0;
  }
  a {
    color: ${theme.colors.forest};
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

export const SubmitRow = styled.div`
  margin-top: 22px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  .hint {
    font-size: 12.5px;
    color: ${theme.colors.muted};
  }
`;

export const DemoNote = styled.p`
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.6;
  color: ${theme.colors.muted};
  padding: 11px 14px;
  border-radius: ${theme.radius.sm};
  background: rgba(201, 162, 39, 0.1);
  border: 1px solid rgba(201, 162, 39, 0.24);
`;

export const Success = styled.div`
  background: #fff;
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.lg};
  padding: 40px 34px;
  text-align: center;
  svg {
    color: ${theme.colors.green};
    margin-bottom: 12px;
  }
  h2 {
    font-size: 28px;
    color: ${theme.colors.forest};
    margin-bottom: 8px;
  }
  p {
    color: ${theme.colors.muted};
    max-width: 500px;
    margin: 0 auto 8px;
    font-size: 14.5px;
  }
  .ref {
    display: inline-block;
    margin: 14px 0 22px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: ${theme.colors.forest};
    background: ${theme.colors.cream};
    border: 1px dashed ${theme.colors.line};
    padding: 8px 16px;
    border-radius: ${theme.radius.pill};
  }
  .actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }
`;
