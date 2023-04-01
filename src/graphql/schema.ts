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
		notifications(skip: Int, take: Int): NotificationsPaginatedPayload! # Notifications of the logged-in user
		# # Tag
		tagArtworks(tagname: String!, skip: Int, take: Int): ArtworksPaginatedPayload!
		# # User
		user(username: String!): UserPayload! # Clicking on a user means fetching a user's details PAGINATION OF ARTWORKS
		userLoggedIn: UserPayload! # Returns logged-in user's details
		userExplore(limit: Int, cursor: Int): ArtworksPaginatedPayload! # Apply Explore Algorithm For Logged-In User Here PAGINATION
		userExploreTags: TagsPayload!
		userFeed(limit: Int, cursor: Int): ArtworksPaginatedPayload! # Gets the main feed for the logged-in user's feed (Apply Main Feed & Suggested Posts Algorithm Here) (PAGINATION)
		userLikes(username: String!, skip: Int, take: Int): ArtworksPaginatedPayload!
		userFollowers(username: String!, skip: Int, take: Int): UsersPaginatedPayload! 
		userFollowings(username: String!, skip: Int, take: Int): UsersPaginatedPayload! 
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
		commentReply(artworkID: ID!, comment: String!, parentCommentID: ID!, replyingToUserID: ID, replyingToCommentID: ID): CommentPayload!
		# # Follow
		followUserCreate(userID: ID!): FollowPayload!
		followUserDelete(userID: ID!): FollowPayload!
		# followTagCreate(tagname: String!):
		# followTagDelete(tagname: String!):
		# # Likes
		likeArtworkCreate(artworkID: ID!): LikePayload!
		likeArtworkDelete(likeID: ID!, artworkID: ID!): LikePayload!
		likeCommentCreate(commentID: ID!): LikePayload!
		likeCommentDelete(likeID: ID!, commentID: ID!): LikePayload!
		# # Notification
		notificationMarkAsRead(notificationID: ID!): NotificationPayload!
		# # Tag
		# # User
		userRegister(username: String!, email: String!, password: String!, avatarUrl: String): UserPayload!
		userLogin(username: String!, password: String!): UserPayload!
		userLogout: Boolean!
		# userForgotPassword():
		# userChangePassword():
	}

	type Subscription {
		newNotification: Notification!
	}

	interface Node { # Node tells that the object the implements Node is persisted and retrieva
		id: ID!
	}

	type User implements Node { # Username, Email, DOB, Profile
		id: ID!
		email: String!
		username: String!
		avatarUrl: String!
		artworks: [Artwork!]! # artworks(limit: Int!, cursor: Int): UserArtworksPaginatedPayload!
		notifications: [Notification!]! # notifications(limit: Int!, cursor: Int): UsernotificationsPaginatedPayload!
		isFollowedByLoggedInUser: Follow
		
		# May Not Need These At All
		# likes: [Artwork!]!
		# followers: [User!]! # Where the User is the Following (MAY NOT NEED)
		# following: [User!]! # Where the User is the Follower (MAY NOT NEED)
		# followedTags: [Tag!]! # Tags are their own seperate thing -> In the Database, its just a bunch of strings
		
	}

	type UserPayload {
		user: User # Needs to be nullable since when an error occurs -> No user is returned
		errors: [Error!]!
	}

	type UsersPaginatedPayload {
		users: [User!]!
		hasMore: Boolean!
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

	type TagsPayload {
		tags: [Tag!]!
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
		# isLikedByLoggedInUser: Boolean # Literally Add this and provide it within the Artwork as a resolver (Will have access to everything from Artwork such as id, imageUrl title, desc, ...)
		isLikedByLoggedInUser: Like # Literally Add this and provide it within the Artwork as a resolver (Will have access to everything from Artwork such as id, imageUrl title, desc, ...)
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
		isLikedByLoggedInUser: Like
	}

	type CommentPayload {
		comment: Comment
		errors: [Error!]!
	}

	type Follow {
		follower: User!
		following: User!
	}

	type FollowPayload {
		follow: Follow
		errors: [Error!]!
	}

	enum NotificationType {
		UPLOADED, FOLLOWED, LIKED, COMMENTED, REPLIED, TAGGED
	}

	type Notification implements Node {
		id: ID!
		artwork: Artwork
		comment: Comment
		isRead: Boolean!
		createdAt: String!
		notificationType: NotificationType!
		notifier: User!
		notifierArtwork: Artwork
		notifierComment: Comment
	}

	type NotificationsPaginatedPayload {
		notifications: [Notification!]!
		hasMore: Boolean!
		errors: [Error!]!
	}

	type NotificationPayload {
		notification: Notification
		errors: [Error!]!
	}

	type Error {
		message: String!
	}	
`;

export default typeDefs;
