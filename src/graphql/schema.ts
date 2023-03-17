const typeDefs = `#graphql
	type Query { # Will contain the Algorithms for Explore, Suggested Posts | Users, Trending Tags
		hello: String
		# Artwork
		artwork(artworkID: ID!): ArtworkPayload! # Clicking on an artwork opens a model with more details about the artwork
		# artworkSearch(): ???
		# # Comment
		# comment(commentID: ID!): ???
		# comments(artworkID: ID!): ??? # PAGINATION
		# commentReplies(parentCommentID: ID!): CommentsPayload!
		# # Follow
		# # Likes
		# # Notification
		# notifications(userID: ID!):
		# # Tag
		# tagArtworks(tagname: String!): PaginatedArtworksPayload!
		# # User
		user(username: String!): UserPayload! # Clicking on a user means fetching a user's details PAGINATION OF ARTWORKS
		userLoggedIn: UserPayload! # Returns logged-in user's details
		# userExplore(): # Apply Explore Algorithm For Logged-In User Here PAGINATION
		userFeed(limit: Int, cursor: Int): ArtworksPaginatedPayload! # Gets the main feed for the logged-in user's feed (Apply Main Feed & Suggested Posts Algorithm Here) (PAGINATION)
		# userSuggestedUsers(): # Component will fetch suggested users (For now randomly pick follows of follows)
	}

	type Mutation { # User needs to be logged-in to do any of these
		# # Artwork
		artworkCreate(title: String!, description: String!, imageUrls: [String!]!): ArtworkPayload!
		artworkUpdate(artworkID: ID!, title: String, description: String, imageUrls: [String!]): ArtworkPayload!
		artworkDelete(artworkID: ID!): ArtworkPayload!
		# # Comment
		commentCreate(artworkID: ID!, comment: String!): CommentPayload!
		commentUpdate(commentID: ID!, comment: String!): CommentPayload!
		commentDelete(commentID: ID!): CommentPayload!
		commentReply(artworkID: ID!, comment: String!, parentCommentID: ID!): CommentPayload!
		# # Follow
		# followUser(userID: ID!):
		# followTag(tagname: String!):
		# # Likes
		likeArtworkCreate(artworkID: ID!): LikePayload!
		likeArtworkDelete(likeID: ID!, artworkID: ID!): LikePayload!
		likeCommentCreate(commentID: ID!): LikePayload!
		likeCommentDelete(likeID: ID!, commentID: ID!): LikePayload!
		# likeComment(commentID: ID!):
		# # Notification
		# # Tag
		# # User
		userRegister(username: String!, email: String!, password: String!): UserPayload!
		userLogin(username: String!, password: String!): UserPayload!
		userLogout: Boolean!
		# userForgotPassword():
		# userChangePassword():
	}

	# type Subscription {
	# 	notifyUser: NotificationPayload!
	# }

	interface Node { # Node tells that the object the implements Node is persisted and retrieva
		id: ID!
	}

	type User implements Node { # Username, Email, DOB, Profile
		id: ID!
		email: String!
		username: String!
		avatarUrl: String!
		artworks: [Artwork!]!
		# artworks(limit: Int!, cursor: Int): UserArtworksPaginatedPayload!
		followers: [Follow!]! # Where the User is the Following
		following: [Follow!]! # Where the User is the Follower
		followedTags: [Tag!]! # Tags are their own seperate thing -> In the Database, its just a bunch of strings
		notifications: [Notification!]!
		# notifications(limit: Int!, cursor: Int): UsernotificationsPaginatedPayload!
		likes: [Like!]!
		likedArtworks: [Artwork!]!
		isFollowedByLoggedInUser: Boolean
	}

	type UserPayload {
		user: User # Needs to be nullable since when an error occurs -> No user is returned
		errors: [Error!]!
	}

	# type UserArtworksPaginatedPayload {
	# 	artworks: [Artwork!]
	# 	hasMore: Boolean
	# 	errors: [Error!]!
	# }

	type UsersSuggestedPayload { # MayNotNEed
		user: [User!]!
		errors: [Error!]!
	}

	type Tag implements Node { # Tagname, Related Artworks, Followers
		id: ID!
		tagname: String!
		artworks: [Artwork!]! # Every artwork that contains the tagname
		isFollowedByLoggedInUser: Boolean
	}

	type TagPayload {
		tag: Tag
		errors: [Error!]!
	}

	type Artwork implements Node { # Description, Image, Tags, Comments, CreateAt
		id: ID!
		imageUrls: [String!]!
		title: String!
		description: String!
		uploader: User!
		createdAt: String! # Eventually created a custom date object
		updatedAt: String!
		likesCount: Int!
		likes: [Like!]!
		tags: [Tag!]! # Tags are regexed when uploading the artwork (An array of strings)
		comments: [Comment!]! # We will query comments where parentComment is null -> These comments will have replies will query for those
		recentComments: [Comment!]! # Most liked comment
		isLikedByLoggedInUser: Boolean # Literally Add this and provide it within the Artwork as a resolver (Will have access to everything from Artwork such as id, imageUrl title, desc, ...)
	}

	type ArtworkPayload {
		artwork: Artwork
		errors: [Error!]!
	}

	type ArtworksPaginatedPayload {
		artworks: [Artwork!]!
		hasMore: Boolean!
		errors: [Error!]!
	}

	enum LikeableType {
		ARTWORK, COMMENT
	}

	type Like { # CreatedAt
		id: ID!
		user: User!
		artwork: Artwork
		comment: Comment
		likeableType: LikeableType!
	}

	type LikePayload {
		like: Like
		errors: [Error!]!
	}

	type Comment implements Node { # CommentText
		id: ID!
		comment: String!
		commenter: User!
		artwork: Artwork! # All comments belong to an artwork
		parentComment: Comment # If parent comment exists, shove the comment under the parent comment as replies
		parentCommentId: ID
		replies: [Comment!]! # Comment in Database will have an array of comments (Self-Relation One-To-Many)
		# When querying the comments
		# If !parentComment -> Show comment under Artwork -> Query the comment's replies
		createdAt: String!
		updatedAt: String!
		likesCount: Int!
		isLikedByLoggedInUser: Boolean
	}

	type CommentPayload {
		comment: Comment
		errors: [Error!]!
	}

	type Follow {
		id: ID!
		follower: User!
		following: User!
	}

	enum NotificationType {
		UPLOADED, FOLLOWED, LIKED, COMMENTED, REPLIED, TAGGED
	}

	union Notifiable = Artwork | User | Comment

	type Notification implements Node {
		id: ID!
		type: NotificationType!
		notifier: User! # If followed, will link to the User's profile
		isRead: Boolean!
		notifiedOf: Notifiable! # Depends on the notification type	
	}

	type Error {
		message: String!
	}	
`;

export default typeDefs;
