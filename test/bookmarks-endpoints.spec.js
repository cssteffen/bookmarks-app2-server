//const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const fixtures = require("./bookmarks-fixtures");

describe("Bookmarks Endpoints", function() {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());
  before("clean the table", () => db("bookmarks").truncate());
  afterEach("cleanup", () => db("bookmarks").truncate());

  /* ========= GET, POST, DELETE /bookmarks ========== */
  describe("GET /bookmarks", () => {
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = fixtures.makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 200 and all of the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_KEY}`)
          .expect(200, testBookmarks);
      });
    });

    describe.only("POST /bookmarks", () => {
      it("creates a bookmark, responding with 201 and the new bookmark", function() {
        //this.retries(3);

        const testNewBookmark = {
          title: "Test new bookmark",
          url: "http://www.newBookmark.com",
          rating: 1,
          description: "Test new bookmark description..."
        };
        return supertest(app)
          .post("/bookmarks")
          .send(testNewBookmark)
          .set("Authorization", `Bearer ${process.env.API_KEY}`)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(testNewBookmark.title);
            expect(res.body.url).to.eql(testNewBookmark.url);
            expect(res.body.rating).to.eql(testNewBookmark.rating);
            expect(res.body.description).to.eql(testNewBookmark.description);
            expect(res.body).to.have.property("id");
            expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`);
            //const expected = new Date().toLocaleString();
            //const actual = new Date(res.body.date_published).toLocaleString();
            //expect(actual).to.eql(expected);
          })

          .then(postRes =>
            supertest(app)
              .get(`/bookmarks/${postRes.body.id}`)
              .set("Authorization", `Bearer ${process.env.API_KEY}`)
              .expect(postRes.body)
          );
      });

      const requiredFields = ["title", "url", "rating", "description"];

      requiredFields.forEach(field => {
        const newBookmark = {
          title: "Test new bookmark",
          url: "http://www.newBookmark.com",
          rating: 1,
          description: "Test new bookmark description..."
        };
        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newBookmark[field];

          return supertest(app)
            .post("/bookmarks")
            .set("Authorization", `Bearer ${process.env.API_KEY}`)
            .send(newBookmark)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` }
            });
        });
      });

      /*
    it("removes XSS attack content from response", () => {
      const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: "http://www.malicious-Bookmark.com",
        description:
          'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
      };
      return supertest(app)
        .post("/bookmarks")
        .set("Authorization", `Bearer ${process.env.API_KEY}`)

        .send(maliciousBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(
            'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
          );
          expect(res.body.description).to.eql(
            `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
          );
        });
    });
    */
    });
  });
  /* ========= GET /bookmarks/:id ========== */
  describe("GET /bookmarks/:bookmark_id", () => {
    context("Given there are bookmarks in the database", () => {
      const testBookmarks = fixtures.makeBookmarksArray();

      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks").insert(testBookmarks);
      });

      it("responds with 200 and the specified bookmark", () => {
        const bookmarkId = 2;
        const expectedBookmark = testBookmarks[bookmarkId - 1];
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_KEY}`)
          .expect(200, expectedBookmark);
      });
    });
  });

  /* ========= GET / GIVEN AN EMPTY DATABASE ======= */
  describe("GET /bookmarks", () => {
    context("Given no bookmarks", () => {
      it("responds with 200 and an empty list", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", `Bearer ${process.env.API_KEY}`)
          .expect(200, []);
      });
    });
  });

  describe("GET /bookmarks/:bookmark_id", () => {
    context("Given no bookmarks", () => {
      it("responds with 404", () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", `Bearer ${process.env.API_KEY}`)
          .expect(404, { error: { message: `Bookmark Not Found` } });
      });
    });
  });
});
