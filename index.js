/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import AppV2 from './AppV2';

AppRegistry.registerComponent(appName, () => AppV2);
