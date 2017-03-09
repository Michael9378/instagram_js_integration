CREATE TABLE instagram_users
  (
    userid  VARCHAR(30) NOT NULL,
    posts INT,
    followers  INT,
    following  INT,
    PRIMARY KEY (userid)
  );

CREATE TABLE instagram_follows
  (
    follower  VARCHAR(30) NOT NULL,
    follows  VARCHAR(30) NOT NULL,
    PRIMARY KEY (follows, follower)
  );


