import { createRoot } from 'react-dom/client';
import App from './App';
import './css/index.scss';
import { Provider } from 'react-redux';
import { store } from './redux/store';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);
// TODO investigate why moving provider inside App breaks hmr
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
