import { ChakraProvider } from '@chakra-ui/provider';
import theme from '@chakra-ui/theme';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import UserProvider from './context/UserContext';
import Login from './screens/Login';
import OAuth2 from './screens/OAuth';
import Register from './screens/Register';
import Authorize from './screens/Authorize';
import UpdateFields from './screens/UpdateFields';
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/oauth2" element={<OAuth2 />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/authorize" element={<Authorize />} />
            <Route path="/update" element={<UpdateFields />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ChakraProvider>
  </StrictMode>
);
