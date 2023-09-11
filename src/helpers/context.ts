import UsersDataSource from "$/src/data-sources/database/users";
import { ContextFunction } from "$/src/types";

export const contextFunctionForUsersDataSource =
  (usersDataSource: UsersDataSource): ContextFunction =>
  async ({ req }) => {
    // Get the user token from the headers.
    const authorizationHeader = req.headers.authorization || "";
    const authorizationComponents = authorizationHeader.split(" ");
    let user = null;
    if (
      authorizationComponents.length === 2 &&
      authorizationComponents[0] === "Bearer"
    ) {
      // Try to retrieve a user with the token
      const jwtToken = authorizationComponents[1];
      user = await usersDataSource.getUserFromJWT(jwtToken);
    }

    return { user };
  };
