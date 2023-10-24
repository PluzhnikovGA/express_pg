exports.up = function (knex) {
  return knex.raw(
    `INSERT INTO users (username, password)
      VALUES ('admin', crypt('pwd007', gen_salt('md5')))`
  );
};

exports.down = function (knex) {
  return knex("users").where({ username: "admin" }).delete();
};
