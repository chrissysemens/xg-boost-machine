import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../layout/AppLayout';
import { Screen } from '../layout/Screen';
import { Stack } from '../layout/Stack';
import { useTheme } from '../theme/useTheme';
import { Dropdown } from 'components';

import { useFirebase, WithId } from '../hooks/useFirebase';
import { useUpcomingFixtures } from '../hooks/useUpcomingFixtures';
import { usePrediction } from 'queries/prediction.queries';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase';

/* ---------- types ---------- */

type TeamDoc = {
  id: number;
  name: string;
  shortCode?: string | null;
  imagePath?: string | null;
};

/* ---------- helpers ---------- */

const formatKickoff = (ts: number) => {
  const d = new Date(ts * 1000);
  const day = d.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const time = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${day} ${time}`;
};

/* ---------- screen ---------- */

const Home = () => {
  const { theme } = useTheme();

  /* teams (small dataset – snapshot is fine) */
  const teamsQ = useFirebase<TeamDoc>({
    collectionName: 'teams',
    constraintsKey: 'all-teams',
  });

useEffect(() => {
  (async () => {
    const snap = await getDocs(query(collection(db, 'fixtures'), limit(3)));
    console.log('getDocs fixtures size:', snap.size);
  })().catch((e) => console.log('getDocs error:', e));
}, []);

  const teamsById = useMemo(() => {
    const map: Record<number, WithId<TeamDoc>> = {};
    for (const t of teamsQ.data) {
      map[Number(t.id)] = t;
    }
    return map;
  }, [teamsQ.data]);

  /* fixtures (next 7 days) */
  const fixturesQ = useUpcomingFixtures();

  /* dropdown state */
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(
    null,
  );

  const selectedFixture = useMemo(() => {
    if (!selectedFixtureId) return null;
    return (
      fixturesQ.data.find((f) => Number(f.id) === selectedFixtureId) ?? null
    );
  }, [fixturesQ.data, selectedFixtureId]);

  console.log(fixturesQ.data);

  const fixturesQ2 = useFirebase<any>({
    collectionName: 'fixtures',
    constraintsKey: 'fixtures-all',
  });
  console.log('fixtures-all', fixturesQ2.data.length, fixturesQ2.data[0]);

  /* dropdown options */
  const fixtureOptions = useMemo(() => {
    return fixturesQ.data.map((f) => {
      const home = teamsById[f.homeTeamId]?.name ?? 'Home';
      const away = teamsById[f.awayTeamId]?.name ?? 'Away';
      console.log('Fixture', f.id, home, 'vs', away);

      return {
        label: `${home} vs ${away} — ${formatKickoff(f.startingAtTimestamp)}`,
        value: String(f.id),
      };
    });
  }, [fixturesQ.data, teamsById]);

  /* prediction request */
  const predictionReq = useMemo(() => {
    if (!selectedFixture) return undefined;

    return {
      homeTeamId: selectedFixture.homeTeamId,
      awayTeamId: selectedFixture.awayTeamId,
      seasonId: selectedFixture.seasonId,
    };
  }, [selectedFixture]);

  const predictionQ = usePrediction(predictionReq);

  return (
    <AppLayout safe padded>
      <Screen scroll>
        <Stack
          gap={6}
          style={{
            paddingTop: theme.spacing[4],
            paddingBottom: theme.spacing[6],
          }}
        >
          <Dropdown
            label="Fixture (next 7 days)"
            placeholder="Select a fixture"
            options={fixtureOptions}
            value={selectedFixtureId ? String(selectedFixtureId) : undefined}
            onChange={(value) =>
              setSelectedFixtureId(value ? Number(value) : null)
            }
            isLoading={fixturesQ.loading || teamsQ.loading}
            isDisabled={!fixtureOptions.length}
          />

          {/* Debug / placeholder */}
          {/* <Text>{JSON.stringify(predictionQ.data, null, 2)}</Text> */}
        </Stack>
      </Screen>
    </AppLayout>
  );
};

export default Home;
