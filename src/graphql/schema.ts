const typeDefs = `#graphql
	type Query { # Will contain the Algorithms for Explore, Suggested Posts | Users, Trending Tags
		hello: String
		# Artwork
		# artwork(artworkID: ID!): # Clicking on an artwork opens a model with more details about the artwork
		# artworkSearch(): ???
		# # Comment
		# comment(commentID: ID!): ???
		# comments(artworkID: ID!): ??? # PAGINATION
		# commentReplies(commentID: ID!):
		# # Follow
		# # Likes
		# # Notification
		# notifications(userID: ID!):
		# # Tag
		# tagArtworks(tagname: String!): PaginatedArtworksPayload!
		# # User
		# user(userID: ID!): # Clicking on a user means fetching a user's details PAGINATION OF ARTWORKS
		# userDetails(): # Returns logged-in user's details
		# userExplore(): # Apply Explore Algorithm For Logged-In User Here PAGINATION
		# userFeed(): # Gets the main feed for the logged-in user's feed (Apply Main Feed & Suggested Posts Algorithm Here) (PAGINATION)
		# userSuggestedUsers(): # Component will fetch suggested users (For now randomly pick follows of follows)
	}

	# type Mutation { # User needs to be logged-in to do any of these
		# # Artwork
		# artworkCreate():
		# artworkUpdate():
		# artworkDelete(artworkID: ID!):
		# # Comment
		# commentCreate(artworkID: ID!, comment: String!, parentCommentID: ID?):
		# commentUpdate(commentID: ID!): 
		# commentDelete(commentID: ID!):
		# commentReply(parentCommentID: ID!):
		# # Follow
		# followUser(userID: ID!):
		# followTag(tagname: String!):
		# # Likes
		# likeArtwork(artworkID: ID!):
		# likeComment(commentID: ID!):
		# # Notification
		# # Tag
		# # User
		# userRegister():
		# userLogin():
		# userLogout():
		# userForgotPassword():
		# userChangePassword():
	# }

	# type Subscription {
	# 	notifyUser: NotificationPayload!
	# }

	interface Node { # Node tells that the object the implements Node is persisted and retrieva
		id: ID!
	}

	type User implements Node { # Username, Email, DOB, Profile
		id: ID!
		username: String!
		email: String!
		avatarUrl: String!
		artworks: [Artwork!]!
		following: [Follow!]! # Where the User is the Follower
		followers: [Follow!]! # Where the User is the Following
		followedTags: [Tag!]! # Tags are their own seperate thing -> In the Database, its just a bunch of strings
		notifications: [Notification]!
		isFollowedByLoggedInUser: Boolean 
	}

	type Tag implements Node { # Tagname, Related Artworks, Followers
		id: ID!
		tagname: String!
		artworks: [Artwork!]! # Every artwork that contains the tagname
		isFollowedByLoggedInUser: Boolean
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
		tags: [Tag]! # Tags are regexed when uploading the artwork (An array of strings)
		comments: [Comment!]! # We will query comments where parentComment is null -> These comments will have replies will query for those
		isLikedByLoggedInUser: Boolean # Literally Add this and provide it within the Artwork as a resolver (Will have access to everything from Artwork such as id, imageUrl title, desc, ...)
	}

	enum LikeableType {
		ARTWORK, COMMENT
	}

	type Like { # CreatedAt
		id: ID!
		user: User!
		artwork: Artwork!
		comment: Comment
		likeableType: LikeableType!
	}

	type Comment implements Node { # CommentText
		id: ID!
		comment: String!
		commenter: User!
		artwork: Artwork! # All comments belong to an artwork
		parentComment: Comment # If parent comment exists, shove the comment under the parent comment as replies
		replies: [Comment!]! # Comment in Database will have an array of comments (Self-Relation One-To-Many)
		# When querying the comments
		# If !parentComment -> Show comment under Artwork -> Query the comment's replies
		createdAt: String!
		updatedAt: String!
		likesCount: Int!
		isLikedByLoggedInUser: Boolean
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
`;

export default typeDefs;