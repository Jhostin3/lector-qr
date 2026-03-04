import { supabase } from './supabase';

export type UserRole = 'vendedor' | 'comprador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  const { data: { user } } = await supabase.auth.getUser();

  return {
    id: data.id,
    name: data.name,
    email: user?.email ?? '',
    role: data.role,
  };
}

// ── Funciones públicas ────────────────────────────────────────────────────────

function translateAuthError(message: string): string {
  if (message.includes('email rate limit')) return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
  if (message.includes('over_email_send_rate_limit')) return 'Límite de emails alcanzado. Espera unos minutos.';
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese correo.';
  if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (message.includes('Unable to validate email address')) return 'El correo no es válido.';
  if (message.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  return message;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));

  const profile = await fetchProfile(data.user.id);
  if (!profile) throw new Error('Perfil no encontrado. Contacta al soporte.');

  return profile;
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<UserProfile> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role } },
  });
  if (error) throw new Error(translateAuthError(error.message));
  if (!data.user) throw new Error('No se pudo crear la cuenta');

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    name,
    role,
  }, { onConflict: 'id' });
  if (profileError) throw new Error('Error al guardar el perfil: ' + profileError.message);

  return { id: data.user.id, name, email, role };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return fetchProfile(user.id);
}
