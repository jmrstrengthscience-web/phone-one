// backend/seed.js
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: __dirname + '/database.sqlite',
  logging: false,
});

(async () => {
  // recreate tables
  await sequelize.drop();
  await sequelize.sync({ force: true });

  // define minimal models (similar to index.js)
  const User = sequelize.define('User', {
    name: DataTypes.STRING, email: { type: DataTypes.STRING, unique: true }, passwordHash: DataTypes.STRING, role: DataTypes.STRING
  });
  const Team = sequelize.define('Team', { name: DataTypes.STRING });
  const Athlete = sequelize.define('Athlete', { name: DataTypes.STRING, dob: DataTypes.STRING, position: DataTypes.STRING });
  const Workout = sequelize.define('Workout', { title: DataTypes.STRING, exercises: DataTypes.TEXT, date: DataTypes.STRING });
  const WellnessEntry = sequelize.define('WellnessEntry', { date: DataTypes.STRING, bodyMap: DataTypes.TEXT, readiness: DataTypes.INTEGER, notes: DataTypes.TEXT });

  User.hasMany(Team, { foreignKey: 'coachId' });
  Team.hasMany(Athlete, { foreignKey: 'teamId' });
  Team.hasMany(Workout, { foreignKey: 'teamId' });
  Athlete.hasMany(WellnessEntry, { foreignKey: 'athleteId' });

  // Create demo coach
  const passwordHash = await bcrypt.hash('password', 10);
  const coach = await User.create({ name: 'Demo Coach', email: 'coach@phorce.com', passwordHash, role: 'coach' });

  // create a team and athletes
  const team = await Team.create({ name: 'Varsity Football', coachId: coach.id });
  const athlete1 = await Athlete.create({ name: 'J. Smith', dob: '2003-05-10', position: 'RB', teamId: team.id });
  const athlete2 = await Athlete.create({ name: 'A. Brown', dob: '2004-01-22', position: 'LB', teamId: team.id });

  // a workout
  const workout = await Workout.create({
    title: 'Lower Power + Sprints',
    exercises: JSON.stringify([
      { name: 'Back Squat', sets: 3, reps: 5, notes: 'Build to 85%' },
      { name: 'Broad Jumps', sets: 3, reps: 5 },
    ]),
    date: (new Date()).toISOString().slice(0,10),
    teamId: team.id
  });

  // wellness entries
  await WellnessEntry.create({ athleteId: athlete1.id, date: (new Date()).toISOString().slice(0,10), bodyMap: JSON.stringify({ hamstring: 3 }), readiness: 8, notes: 'Slight tightness' });

  console.log('Seed complete.');
  console.log('Demo coach login: coach@phorce.com / password');
  process.exit(0);
})();
