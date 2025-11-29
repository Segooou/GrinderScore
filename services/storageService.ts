import { supabase } from './supabaseClient';
import { Trade, UserSettings, User, ChatMessage } from '../types';

// --- AUTH METHODS (Supabase) ---

export const registerUser = async (name: string, email: string, password: string): Promise<{ user: User | null, error: any }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (error) return { user: null, error };

  if (data.user) {
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata.name || '',
    };
    
    // Create initial settings
    await saveSettings(user.id, {
      initialCapital: 10000,
      monthlyGoal: 1000,
      riskPerTrade: 1
    });

    return { user, error: null };
  }

  return { user: null, error: 'Unknown error' };
};

export const loginUser = async (email: string, password: string): Promise<{ user: User | null, error: any }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error };

  if (data.user) {
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata.name || (data.user.email ? data.user.email.split('@')[0] : 'Trader'),
    };

    // Check if settings exist, if not create default
    const existingSettings = await getSettings(user.id);
    if (!existingSettings.initialCapital) { // Basic check if object is empty/default
         await saveSettings(user.id, {
            initialCapital: 10000,
            monthlyGoal: 1000,
            riskPerTrade: 1
        });
    }

    return { user, error: null };
  }

  return { user: null, error: 'Login failed' };
};

export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const getCurrentSessionUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    return {
      id: data.session.user.id,
      email: data.session.user.email || '',
      name: data.session.user.user_metadata.name || (data.session.user.email ? data.session.user.email.split('@')[0] : 'Trader'),
    };
  }
  return null;
};

// --- DATA METHODS (Supabase Database) ---

export const getTrades = async (userId: string): Promise<Trade[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error loading trades:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    userId: t.user_id,
    date: t.date,
    asset: t.asset,
    direction: t.direction,
    marketType: t.market_type,
    entryPrice: t.entry_price,
    exitPrice: t.exit_price,
    quantity: t.quantity,
    investedValue: t.invested_value,
    pnl: t.pnl,
    stopLoss: t.stop_loss,
    takeProfit: t.take_profit,
    entryReason: t.entry_reason,
    exitReason: t.exit_reason,
    notes: t.notes,
    imageUrl: t.image_url,
    strategy: t.strategy
  }));
};

export const saveTrade = async (userId: string, trade: Trade): Promise<void> => {
  if (!userId) return;

  const dbTrade = {
    id: trade.id,
    user_id: userId,
    date: trade.date,
    asset: trade.asset,
    direction: trade.direction,
    market_type: trade.marketType,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    quantity: trade.quantity,
    invested_value: trade.investedValue,
    pnl: trade.pnl,
    stop_loss: trade.stopLoss,
    take_profit: trade.takeProfit,
    entry_reason: trade.entryReason,
    exit_reason: trade.exitReason,
    notes: trade.notes,
    image_url: trade.imageUrl,
    strategy: trade.strategy
  };

  const { error } = await supabase
    .from('trades')
    .upsert(dbTrade);

  if (error) console.error('Error saving trade:', error);
};

export const deleteTrade = async (userId: string, id: string): Promise<void> => {
  if (!userId) return;
  await supabase.from('trades').delete().eq('id', id).eq('user_id', userId);
};

// --- STORAGE METHODS (Supabase Storage) ---

export const uploadTradeImage = async (file: File): Promise<string | null> => {
    const bucketName = 'trade-images';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image to Supabase:', uploadError);
            
            // Tratamento específico para bucket não encontrado
            if (uploadError.message.includes("Bucket not found") || (uploadError as any).statusCode === '404') {
                alert("CONFIGURAÇÃO NECESSÁRIA:\n\nO bucket 'trade-images' não existe no seu projeto Supabase.\n\nPor favor, crie-o no painel do Supabase:\n1. Vá em Storage\n2. Create new bucket\n3. Nome: trade-images\n4. Marque 'Public bucket'");
            }
            return null;
        }

        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (e) {
        console.error("Unexpected upload error:", e);
        return null;
    }
};

// --- SETTINGS METHODS ---

export const getSettings = async (userId: string): Promise<UserSettings> => {
  if (!userId) return { initialCapital: 10000, monthlyGoal: 1000, riskPerTrade: 1 };

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { initialCapital: 10000, monthlyGoal: 1000, riskPerTrade: 1 };
  }

  return {
    initialCapital: data.initial_capital,
    monthlyGoal: data.monthly_goal,
    riskPerTrade: data.risk_per_trade
  };
};

export const saveSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  if (!userId) return;

  const dbSettings = {
    user_id: userId,
    initial_capital: settings.initialCapital,
    monthly_goal: settings.monthlyGoal,
    risk_per_trade: settings.riskPerTrade
  };

  const { error } = await supabase.from('settings').upsert(dbSettings, { onConflict: 'user_id' });
  
  if (error) console.error('Error saving settings:', error);
};

// --- CHAT METHODS (Supabase) ---

export const getChatHistory = async (userId: string, date: string): Promise<ChatMessage[]> => {
  if (!userId || !date) return [];

  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching chat:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    role: c.role,
    text: c.text,
    timestamp: c.timestamp,
    image: c.image_url,
    isThinking: c.is_thinking
  }));
};

export const saveChatMessage = async (userId: string, date: string, message: ChatMessage): Promise<void> => {
  if (!userId || !date) return;

  const dbMessage = {
    id: message.id,
    user_id: userId,
    date: date,
    role: message.role,
    text: message.text,
    timestamp: message.timestamp,
    image_url: message.image,
    is_thinking: message.isThinking
  };

  const { error } = await supabase.from('chat_history').insert(dbMessage);
  if (error) console.error('Error saving message:', error);
};

export const getChatUsageDates = async (userId: string, year: number, month: number): Promise<string[]> => {
    if (!userId) return [];

    // Construct start and end dates for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

    const { data, error } = await supabase
        .from('chat_history')
        .select('date')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) {
        console.error("Error fetching chat dates:", error);
        return [];
    }

    if (!data) return [];

    const uniqueDates = new Set(data.map((item: any) => item.date));
    return Array.from(uniqueDates) as string[];
}
