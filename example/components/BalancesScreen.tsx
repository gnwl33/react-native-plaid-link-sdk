import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Platform,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

interface Balances {
  available: Number;
  current: Number;
  limit: Number;
  iso_currency_code: String;
  unofficial_currency_code: String;
}

interface Account {
  account_id: String;
  name: String;
  balances: Balances;
  official_name: String;
  type: String;
  subtype: String;
  mask: String;
}

const BalancesScreen = ({ route, navigation }: any) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const publicToken = route.params.publicToken;

  const fetchBalances = useCallback(async () => {
    setLoading(true);

    const baseUrl =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:8000/'
        : 'http://localhost:8000/';

    await fetch(`${baseUrl}api/set_access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: `public_token=${publicToken}`,
    });

    const res = await fetch(`${baseUrl}api/balance`);

    try {
      const data = await res.json();
      setAccounts(data.accounts);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, [publicToken]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const renderItem = ({ item }: { item: Account }) => {
    const { name, balances } = item;
    return (
      <View style={styles.account}>
        <Text>{name}</Text>
        <Text>${balances.current.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchBalances} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  account: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
});

export default BalancesScreen;
