import React, { useState, useEffect } from 'react';
import { Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { motion } from 'framer-motion';

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    if (window.scrollY > 300) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  return (
    <>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 1000,
          }}
        >
          <Fab 
            color="primary" 
            size="small" 
            onClick={scrollToTop}
            sx={{
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              '&:hover': {
                transform: 'translateY(-3px)',
                transition: 'transform 0.2s ease-in-out',
              }
            }}
          >
            <KeyboardArrowUpIcon />
          </Fab>
        </motion.div>
      )}
    </>
  );
};

export default ScrollToTop;