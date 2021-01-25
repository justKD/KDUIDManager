import { KDUIDManager } from './dist/KDUIDManager.bundle';

const runManagerExample = () => {
  const manager = KDUIDManager();

  const entity = {
    name: 'kd',
  };

  const uid = manager.generateUIDFor(entity);

  console.log(`generated ${uid}`);
  console.log(manager.hasUIDFor(entity));
  console.log(manager.getUIDFor(entity));

  console.log(manager.hasKeyFor(uid));
  console.log(manager.getKeyFor(uid));

  console.log(manager.keys());
  console.log(manager.uids());
  console.log(manager.entries());
};

const runDeleteExample = () => {
  const manager = KDUIDManager();

  const entities = [{ name: 0 }, { name: 1 }, { name: 2 }];
  entities.forEach((entity) => manager.generateUIDFor(entity));
  console.log(manager.entries());

  const uid1 = manager.getUIDFor(entities[0]);
  manager.deleteEntryForUID(uid1);
  console.log('delete entry 0 by uid');
  console.log(manager.entries());

  manager.deleteEntryForKey(entities[1]);
  console.log('delete entry 1 by key');
  console.log(manager.entries());

  console.log('generate new uids');
  entities.forEach((entity) => manager.generateUIDFor(entity));
  const entries = manager.entries();
  console.log(entries);

  console.log('reset all entries');
  manager.reset();
  console.log(manager.entries());

  console.log('test setEntries()');
  manager.setEntries(entries);
  console.log(manager.entries());
};

runManagerExample();
console.log();
runDeleteExample();
