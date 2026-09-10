import sqliteDb, { initializeDatabase } from './sqlite.js';
import { supabase } from './supabase.js';
import 'dotenv/config';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

export const dbService = {
  initialize() {
    if (isProduction) {
      console.log('[DB] Running in PRODUCTION mode. Routing queries to Supabase Cloud.');
    } else {
      console.log('[DB] Running in DEVELOPMENT mode. Initializing local SQLite database.');
      initializeDatabase();
    }
  },
  
  async getOrders(limit = 3) {
    if (isProduction) {
      try {
        const { data, error } = await supabase.from('orders').select('*').limit(limit);
        if (error) { 
          console.error('[Supabase] getOrders error:', error.message); 
          return []; 
        }
        return data || [];
      } catch(e) {
        console.error('[Supabase] Request failed:', e);
        return [];
      }
    } else {
      try {
        return sqliteDb.prepare(`SELECT * FROM orders LIMIT ${limit}`).all();
      } catch (err) {
        console.error('[SQLite] getOrders error:', err);
        return [];
      }
    }
  },

  async logInteraction(userId: string, intent: string, content: string) {
    if (isProduction) {
      const { error } = await supabase.from('interactions').insert([{ 
        user_id: userId, 
        intent, 
        content 
      }]);
      if (error) {
        console.warn("[Supabase] Interaction log error:", error.message);
      } else {
        console.log("[Supabase] Interaction synced to cloud successfully.");
      }
    } else {
      try {
        sqliteDb.prepare('INSERT INTO interactions (id, user_id, intent, content) VALUES (?, ?, ?, ?)').run(
          Math.random().toString(36).substring(7), userId, intent, content
        );
        console.log("[SQLite] Interaction logged locally.");
      } catch (err) {
        console.warn("[SQLite] Interaction log error:", err);
      }
    }
  }
};
