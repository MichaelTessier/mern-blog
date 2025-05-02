import 'dotenv/config';

import { database } from './services/mongodb/mongodb.service';

database.connect()

import './api/server';