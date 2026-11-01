'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import theme from '@/styles/theme';

const Item = styled.div`
  border: 1px solid ${theme.colors.line};
  border-radius: ${theme.radius.md};
  background: #fff;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
  &.open {
    box-shadow: ${theme.shadow.soft};
    border-color: ${theme.colors.creamDark};
  }
  & + & {
    margin-top: 12px;
  }
`;

const Q = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: left;
  padding: 18px 22px;
  font-size: 15.5px;
  font-weight: 600;
  color: ${theme.colors.ink};
  svg {
    flex-shrink: 0;
    color: ${theme.colors.green};
    transition: transform 0.3s ease;
  }
  .open & svg {
    transform: rotate(45deg);
  }
`;

const A = styled(motion.div)`
  overflow: hidden;
  p {
    padding: 0 22px 20px;
    color: ${theme.colors.muted};
    font-size: 14.5px;
    max-width: 60ch;
  }
`;

export default function FAQAccordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      {items.map((item, i) => (
        <Item key={item.question} className={open === i ? 'open' : ''}>
          <Q onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {item.question}
            <Plus size={18} />
          </Q>
          <AnimatePresence initial={false}>
            {open === i && (
              <A
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <p>{item.answer}</p>
              </A>
            )}
          </AnimatePresence>
        </Item>
      ))}
    </div>
  );
}
