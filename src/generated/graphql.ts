import { GraphQLResolveInfo } from 'graphql';
import { Context } from '../types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type GroupedTasks = {
  __typename?: 'GroupedTasks';
  ARCHIVED?: Maybe<Array<Task>>;
  DONE?: Maybe<Array<Task>>;
  IN_PROGRESS?: Maybe<Array<Task>>;
  TO_DO?: Maybe<Array<Task>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  batchUpdateTasksStatuses?: Maybe<Array<Maybe<Task>>>;
  createTask?: Maybe<Task>;
  createUser?: Maybe<User>;
  deleteTask: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  moveTaskToPosition?: Maybe<Array<Maybe<Task>>>;
  swapTasks?: Maybe<Array<Maybe<Task>>>;
  updateTask?: Maybe<Task>;
  updateUser?: Maybe<User>;
};


export type MutationBatchUpdateTasksStatusesArgs = {
  status: TaskStatus;
  taskIds: Array<Scalars['Int']['input']>;
};


export type MutationCreateTaskArgs = {
  input: TaskInput;
};


export type MutationCreateUserArgs = {
  input: UserInput;
};


export type MutationDeleteTaskArgs = {
  taskId: Scalars['Int']['input'];
};


export type MutationMoveTaskToPositionArgs = {
  position: Scalars['Int']['input'];
  taskId: Scalars['Int']['input'];
};


export type MutationSwapTasksArgs = {
  aTaskId: Scalars['Int']['input'];
  bTaskId: Scalars['Int']['input'];
};


export type MutationUpdateTaskArgs = {
  input?: InputMaybe<TaskUpdateInput>;
  taskId: Scalars['Int']['input'];
};


export type MutationUpdateUserArgs = {
  input: UserUpdateInput;
};

export type PasswordUpdate = {
  oldPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordRepeated: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getCurrentUser?: Maybe<User>;
  getJWT?: Maybe<Scalars['String']['output']>;
  getStatusGroupedTasks?: Maybe<GroupedTasks>;
  getTask?: Maybe<Task>;
  getTasks?: Maybe<Array<Maybe<Task>>>;
};


export type QueryGetJwtArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


export type QueryGetStatusGroupedTasksArgs = {
  sortedBy?: InputMaybe<Array<SortEnum>>;
  withStatuses?: InputMaybe<Array<TaskStatus>>;
};


export type QueryGetTaskArgs = {
  taskId: Scalars['Int']['input'];
};


export type QueryGetTasksArgs = {
  sortedBy?: InputMaybe<Array<SortEnum>>;
  withStatuses?: InputMaybe<Array<TaskStatus>>;
};

export enum SortEnum {
  CreatedAt = 'CREATED_AT',
  Order = 'ORDER',
  Status = 'STATUS',
  Title = 'TITLE',
  UpdatedAt = 'UPDATED_AT'
}

export type Task = {
  __typename?: 'Task';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  order: Scalars['Int']['output'];
  status: TaskStatus;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type TaskInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TaskStatus>;
  title: Scalars['String']['input'];
};

export enum TaskStatus {
  Archived = 'ARCHIVED',
  Done = 'DONE',
  InProgress = 'IN_PROGRESS',
  ToDo = 'TO_DO'
}

export type TaskUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<TaskStatus>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserInput = {
  password: Scalars['String']['input'];
  passwordRepeated: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type UserUpdateInput = {
  passwordDetails?: InputMaybe<PasswordUpdate>;
  username?: InputMaybe<Scalars['String']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  GroupedTasks: ResolverTypeWrapper<GroupedTasks>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PasswordUpdate: PasswordUpdate;
  Query: ResolverTypeWrapper<{}>;
  SortEnum: SortEnum;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Task: ResolverTypeWrapper<Task>;
  TaskInput: TaskInput;
  TaskStatus: TaskStatus;
  TaskUpdateInput: TaskUpdateInput;
  User: ResolverTypeWrapper<User>;
  UserInput: UserInput;
  UserUpdateInput: UserUpdateInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  GroupedTasks: GroupedTasks;
  Int: Scalars['Int']['output'];
  Mutation: {};
  PasswordUpdate: PasswordUpdate;
  Query: {};
  String: Scalars['String']['output'];
  Task: Task;
  TaskInput: TaskInput;
  TaskUpdateInput: TaskUpdateInput;
  User: User;
  UserInput: UserInput;
  UserUpdateInput: UserUpdateInput;
};

export type GroupedTasksResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GroupedTasks'] = ResolversParentTypes['GroupedTasks']> = {
  ARCHIVED?: Resolver<Maybe<Array<ResolversTypes['Task']>>, ParentType, ContextType>;
  DONE?: Resolver<Maybe<Array<ResolversTypes['Task']>>, ParentType, ContextType>;
  IN_PROGRESS?: Resolver<Maybe<Array<ResolversTypes['Task']>>, ParentType, ContextType>;
  TO_DO?: Resolver<Maybe<Array<ResolversTypes['Task']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  batchUpdateTasksStatuses?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationBatchUpdateTasksStatusesArgs, 'status' | 'taskIds'>>;
  createTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreateTaskArgs, 'input'>>;
  createUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  deleteTask?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTaskArgs, 'taskId'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  moveTaskToPosition?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationMoveTaskToPositionArgs, 'position' | 'taskId'>>;
  swapTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, RequireFields<MutationSwapTasksArgs, 'aTaskId' | 'bTaskId'>>;
  updateTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationUpdateTaskArgs, 'taskId'>>;
  updateUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'input'>>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getCurrentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  getJWT?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryGetJwtArgs, 'password' | 'username'>>;
  getStatusGroupedTasks?: Resolver<Maybe<ResolversTypes['GroupedTasks']>, ParentType, ContextType, Partial<QueryGetStatusGroupedTasksArgs>>;
  getTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryGetTaskArgs, 'taskId'>>;
  getTasks?: Resolver<Maybe<Array<Maybe<ResolversTypes['Task']>>>, ParentType, ContextType, Partial<QueryGetTasksArgs>>;
};

export type TaskResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TaskStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  GroupedTasks?: GroupedTasksResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

