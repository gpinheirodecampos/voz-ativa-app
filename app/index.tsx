import { Redirect } from 'expo-router';

// Redireciona para a rota principal (tab home)
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
