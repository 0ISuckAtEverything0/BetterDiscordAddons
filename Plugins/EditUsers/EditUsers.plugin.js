/**
 * @name EditUsers
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditUsers
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditUsers/EditUsers.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EditUsers",
			"author": "DevilBro",
			"version": "4.0.7",
			"description": "Allow you to change the icon, name, tag and color of users"
		},
		"changeLog": {
			"fixed": {
				"Compact": "Fixed some issues with compact mode"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var changedUsers = {}, settings = {};
	
		return class EditUsers extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						changeInContextMenu:	{value: true, 	inner: true,		description: "User ContextMenu"},
						changeInChatTextarea:	{value: true, 	inner: true,		description: "Chat Textarea"},
						changeInChatWindow:		{value: true, 	inner: true,		description: "Messages"},
						changeInReactions:		{value: true, 	inner: true,		description: "Reactions"},
						changeInMentions:		{value: true, 	inner: true,		description: "Mentions"},
						changeInVoiceChat:		{value: true, 	inner: true,		description: "Voice Channels"},
						changeInMemberList:		{value: true, 	inner: true,		description: "Member List"},
						changeInRecentDms:		{value: true, 	inner: true,		description: "Direct Message Notifications"},
						changeInDmsList:		{value: true, 	inner: true,		description: "Direct Message List"},
						changeInDmHeader:		{value: true, 	inner: true,		description: "Direct Message Header"},
						changeInDmCalls:		{value: true, 	inner: true,		description: "Calls/ScreenShares"},
						changeInTyping:			{value: true, 	inner: true,		description: "Typing List"},
						changeInFriendList:		{value: true, 	inner: true,		description: "Friend List"},
						changeInInviteList:		{value: true, 	inner: true,		description: "Invite List"},
						changeInActivity:		{value: true, 	inner: true,		description: "Activity Page"},
						changeInUserPopout:		{value: true, 	inner: true,		description: "User Popouts"},
						changeInUserProfile:	{value: true, 	inner: true,		description: "User Profile Modal"},
						changeInAutoComplete:	{value: true, 	inner: true,		description: "Autocomplete Menu"},
						changeInAuditLog:		{value: true, 	inner: true,		description: "Audit Log"},
						changeInEmojiLog:		{value: true, 	inner: true,		description: "Emoji Upload Log"},
						changeInMemberLog:		{value: true, 	inner: true,		description: "Member Log"},
						changeInQuickSwitcher:	{value: true, 	inner: true,		description: "Quick Switcher"},
						changeInSearchPopout:	{value: true, 	inner: true,		description: "Search Popout"},
						changeInUserAccount:	{value: true, 	inner: true,		description: "Your Account Information"},
						changeInAppTitle:		{value: true, 	inner: true,		description: "Discord App Title (DMs)"}
					}
				};
			
				this.patchedModules = {
					before: {
						HeaderBarContainer: "render",
						ChannelEditorContainer: "render",
						ChannelAutoComplete: "render",
						AutocompleteUserResult: "render",
						UserPopout: "render",
						UserProfile: "render",
						UserInfo: "default",
						NowPlayingHeader: "Header",
						VoiceUser: "render",
						Account: "render",
						Message: "default",
						MessageUsername: "default",
						MessageContent: "type",
						ReactorsComponent: "render",
						ChannelReply: "default",
						MemberListItem: "render",
						AuditLog: "render",
						GuildSettingsEmoji: "render",
						MemberCard: "render",
						SettingsInvites: "render",
						GuildSettingsBans: "render",
						InvitationCard: "render",
						PrivateChannel: "render",
						PrivateChannelRecipientsInvitePopout: "render",
						QuickSwitchUserResult: "render",
						SearchPopoutComponent: "render",
						PrivateChannelCallParticipants: "render",
						ChannelCall: "render",
						PictureInPictureVideo: "default",
						UserSummaryItem: "render"
					},
					after: {
						ChannelCallHeader: "default",
						AutocompleteUserResult: "render",
						DiscordTag: "default",
						NameTag: "default",
						UserPopout: "render",
						NowPlayingHeader: "Header",
						VoiceUser: "render",
						Account: "render",
						PrivateChannelEmptyMessage: "default",
						MessageHeader: "default",
						MessageUsername: "default",
						MessageContent: "type",
						Reaction: "render",
						ReactorsComponent: "render",
						Mention: "default",
						UserMention: "UserMention",
						ChannelReply: "default",
						MemberListItem: "render",
						UserHook: "render",
						InvitationCard: "render",
						InviteModalUserRow: "default",
						TypingUsers: "render",
						DirectMessage: "render",
						RTCConnection: "render",
						PrivateChannel: "render",
						QuickSwitchUserResult: "render",
						IncomingCallModal: "default"
					}
				};
				
				this.patchPriority = 3;
				
				this.css = `
					${BDFDB.dotCNS.chat + BDFDB.dotCN.messageusername}:hover > span[style*="color"],
					${BDFDB.dotCN.voicedetailschannel}:hover > span[style*="color"] {
						text-decoration: underline;
					}
					${BDFDB.dotCNS.userpopoutheadernamewrapper + BDFDB.dotCN.bottag} {
						position: relative;
						bottom: 1px;
					}
					${BDFDB.dotCNS.dmchannel + BDFDB.dotCN.bottag} {
						margin-left: 4px;
					}
					${BDFDB.dotCNS.userinfo + BDFDB.dotCN.userinfodiscriminator} {
						display: none;
					}
					${BDFDB.dotCNS.userinfohovered + BDFDB.dotCN.userinfodiscriminator} {
						display: block;
					}
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] code.inline,
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] blockquote,
					${BDFDB.dotCN.messagemarkup} span[style*="linear-gradient"] ${BDFDB.dotCN.spoilertext} {
						color: var(--text-normal);
					}
				`;
			}
			
			onStart() {
				let observer = new MutationObserver(_ => {this.changeAppTitle();});
				BDFDB.ObserverUtils.connect(this, document.head.querySelector("title"), {name: "appTitleObserver", instance: observer}, {childList: true});
				
				let searchGroupData = BDFDB.ObjectUtils.get(BDFDB.ModuleUtils.findByName("SearchPopoutComponent", false), "exports.GroupData");
				if (BDFDB.ObjectUtils.is(searchGroupData)) {
					BDFDB.PatchUtils.patch(this, searchGroupData.FILTER_FROM, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							};
						}
					}});
					BDFDB.PatchUtils.patch(this, searchGroupData.FILTER_MENTIONS, "component", {after: e => {
						if (typeof e.returnValue.props.renderResult == "function") {
							let renderResult = e.returnValue.props.renderResult;
							e.returnValue.props.renderResult = (...args) => {
								let result = renderResult(...args);
								this.processSearchPopoutUserResult({instance: {props: e.methodArguments[0]}, returnvalue: result});
								return result;
							};
						}
					}});
				}
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.MENTIONS, "queryResults", {after: e => {
					let userArray = [];
					for (let id in changedUsers) if (changedUsers[id] && changedUsers[id].name) {
						let user = BDFDB.LibraryModules.UserStore.getUser(id);
						if (user && (e.methodArguments[0].recipients.includes(id) || (e.methodArguments[0].guild_id && BDFDB.LibraryModules.MemberStore.getMember(e.methodArguments[0].guild_id, id)))) userArray.push(Object.assign({
							lowerCaseName: changedUsers[id].name.toLowerCase(),
							user
						}, changedUsers[id]));
					}
					userArray = BDFDB.ArrayUtils.keySort(userArray.filter(n => e.returnValue.users.every(comp => comp.user.id != n.user.id) && n.lowerCaseName.indexOf(e.methodArguments[1]) != -1), "lowerCaseName");
					e.returnValue.users = [].concat(e.returnValue.users, userArray.map(n => {return {user: n.user};})).slice(0, BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS);
				}});
				
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) if (!this.defaults.settings[key].inner) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Change Users in:",
					children: Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					}))
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: "Reset all Users",
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all users?", _ => {
							BDFDB.DataUtils.remove(this, "users");
							this.forceUpdateAll();
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.RESET
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				changedUsers = BDFDB.DataUtils.load(this, "users");
				settings = BDFDB.DataUtils.get(this, "settings");
					
				this.changeAppTitle();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
		
			onUserContextMenu (e) {
				if (e.instance.props.user) {
					let userName = this.getUserData(e.instance.props.user.id).username;
					if (userName != e.instance.props.user.username && settings.changeInContextMenu) {
						let [kickChilden, kickIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "kick"});
						if (kickIndex > -1) kickChilden[kickIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("KICK_USER", userName);
						let [banChilden, banIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "ban"});
						if (banIndex > -1) banChilden[banIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("BAN_USER", userName);
						let [muteChilden, muteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mute-channel"});
						if (muteIndex > -1) muteChilden[muteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("MUTE_CHANNEL", `@${userName}`);
						let [unmuteChilden, unmuteIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "unmute-channel"});
						if (unmuteIndex > -1) unmuteChilden[unmuteIndex].props.label = BDFDB.LanguageUtils.LanguageStringsFormat("UNMUTE_CHANNEL", `@${userName}`);
					}
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: [
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.context_localusersettings,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
								children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
									children: [
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.submenu_usersettings,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
											action: _ => {
												this.openUserSettingsModal(e.instance.props.user);
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.submenu_resetsettings,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
											disabled: !changedUsers[e.instance.props.user.id],
											action: _ => {
												BDFDB.DataUtils.remove(this, "users", e.instance.props.user.id);
												this.forceUpdateAll();
											}
										})
									]
								})
							})
						]
					}));
				}
			}
			
			processChannelEditorContainer (e) {
				if (!e.instance.props.disabled && e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && settings.changeInChatTextarea) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channel.recipients[0]);
					if (user) e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `@${changedUsers[user.id] && changedUsers[user.id].name || user.username}`);
				}
			}

			processAutocompleteUserResult (e) {
				if (e.instance.props.user && settings.changeInAutoComplete) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data && data.name) e.instance.props.nick = data.name;
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.marginleft8]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id);
					}
				}
			}

			processHeaderBarContainer (e) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
				if (channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInDmHeader) {
					let userName = BDFDB.ReactUtils.findChild(e.instance, {name: "Title"});
					if (userName) {
						let recipientId = channel.getRecipientId();
						userName.props.children = this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
				}
			}

			processChannelCallHeader (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInDmHeader) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Title"});
					if (userName) {
						let recipientId = e.instance.props.channel.getRecipientId();
						userName.props.children = this.getUserData(recipientId).username;
						this.changeUserColor(userName, recipientId);
					}
				}
			}
			
			processDiscordTag (e) {
				this.processNameTag(e);
			}
			
			processNameTag (e) {
				if (e.instance.props.user && (e.instance.props.className || e.instance.props.usernameClass)) {
					let change = false, guildId = null;
					let changeBackground = false;
					let tagClass = "";
					switch (e.instance.props.className) {
						case BDFDB.disCN.userpopoutheadertagnonickname:
							change = settings.changeInUserPopout;
							guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
							changeBackground = true;
							tagClass = BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.userprofilenametag:
							change = settings.changeInUserProfile;
							guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
							changeBackground = true;
							tagClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.guildsettingsinviteusername:
							change = settings.changeInMemberLog;
							break;
						case BDFDB.disCN.userinfodiscordtag:
							change = settings.changeInFriendList;
							tagClass = BDFDB.disCN.bottagnametag;
							break;
					}
					switch (e.instance.props.usernameClass) {
						case BDFDB.disCN.messagereactionsmodalusername:
							change = settings.changeInReactions && !BDFDB.LibraryModules.MemberStore.getNick(BDFDB.LibraryModules.LastGuildStore.getGuildId(), e.instance.props.user.id);
							break;
					}
					if (change) {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.username]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id, {
							changeBackground: changeBackground
						});
						if (tagClass) this.injectBadge(e.returnvalue.props.children, e.instance.props.user.id, guildId, 2, {
							tagClass: tagClass,
							useRem: e.instance.props.useRemSizes,
							inverted: e.instance.props.invertBotTagColor
						});
					}
				}
			}

			processUserPopout (e) {
				if (e.instance.props.user && settings.changeInUserPopout) {
					let data = changedUsers[e.instance.props.user.id];
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id, true, true);
						if (data) {
							if (data.name) {
								e.instance.props.nickname = data.name;
								if (e.instance.props.guildMember) e.instance.props.guildMember = Object.assign({}, e.instance.props.guildMember, {nick: data.name});
							}
							if (data.removeStatus || data.status || data.statusEmoji) e.instance.props.customStatusActivity = this.createCustomStatus(data);
						}
					}
					else {
						if (data && (data.color1 || data.color2 || data.tag)) {
							let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadernickname]]});
							if (index > -1) {
								this.changeUserColor(children[index], e.instance.props.user.id, {changeBackground: true});
								this.injectBadge(children, e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, {
									tagClass: BDFDB.disCN.bottagnametag,
									inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
								});
							}
						}
					}
				}
			}

			processUserProfile (e) {
				if (e.instance.props.user && settings.changeInUserProfile) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					let data = changedUsers[e.instance.props.user.id];
					if (data && (data.removeStatus || data.status || data.statusEmoji)) e.instance.props.customStatusActivity = this.createCustomStatus(data);
				}
			}

			processUserInfo (e) {
				if (e.instance.props.user && settings.changeInFriendList) {
					e.instance.props.user = this.getUserData(e.instance.props.user.id);
					if (BDFDB.ReactUtils.isValidElement(e.instance.props.subText)) {
						let data = changedUsers[e.instance.props.user.id];
						if (data && (data.removeStatus || data.status || data.statusEmoji)) {
							e.instance.props.subText.props.activities = [].concat(e.instance.props.subText.props.activities).filter(n => n && n.type != 4);
							let activity = this.createCustomStatus(data);
							if (activity) e.instance.props.subText.props.activities.unshift(activity);
						}
					}
				}
			}

			processNowPlayingHeader (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.priorityUser) && e.instance.props.priorityUser.user && settings.changeInFriendList) {
					if (!e.returnvalue) {
						let titleIsName = e.instance.props.priorityUser.user.username == e.instance.props.title;
						e.instance.props.priorityUser.user = this.getUserData(e.instance.props.priorityUser.user.id);
						if (titleIsName) e.instance.props.title = e.instance.props.priorityUser.user.username;
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Header"});
						if (userName) this.changeUserColor(userName, e.instance.props.priorityUser.user.id);
					}
				}
			}

			processVoiceUser (e) {
				if (e.instance.props.user && settings.changeInVoiceChat) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data && data.name) e.instance.props.nick = data.name;
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.voicename]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id, {modify: e.instance.props});
					}
				}
			}

			processAccount (e) {
				if (e.instance.props.currentUser && settings.changeInUserAccount) {
					let data = changedUsers[e.instance.props.currentUser.id];
					if (!e.returnvalue) {
						e.instance.props.currentUser = this.getUserData(e.instance.props.currentUser.id);
						if (data && (data.removeStatus || data.status || data.statusEmoji)) e.instance.props.customStatusActivity = this.createCustomStatus(data);
					}
					else {
						if (data && (data.color1 || data.color2)) {
							let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Tooltip"});
							if (tooltip && typeof tooltip.props.children == "function") {
								let renderChildren = tooltip.props.children;
								tooltip.props.children = (...args) => {
									let renderedChildren = renderChildren(...args);
									let userName = BDFDB.ReactUtils.findChild(renderedChildren, {name: "PanelTitle"});
									if (userName) this.changeUserColor(userName, e.instance.props.currentUser.id);
									return renderedChildren;
								}
							}
						}
					}
				}
			}

			processPrivateChannelEmptyMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInChatWindow) {
					let recipientId = e.instance.props.channel.getRecipientId();
					let name = this.getUserData(recipientId).username;
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {props: "src"});
					if (avatar) avatar.props.src = this.getUserAvatar(recipientId);
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "h1"});
					if (userName) {
						userName.props.children = BDFDB.ReactUtils.createElement("span", {children: name});
						this.changeUserColor(userName.props.children, recipientId);
					}
					userName = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "strong"});
					if (userName) {
						userName.props.children = "@" + name;
						this.changeUserColor(userName, recipientId);
					}
				}
			}
			
			processMessage (e) {
				if (settings.changeInChatWindow) {
					let header = e.instance.props.childrenHeader;
					if (header && header.props && header.props.message) {
						let data = changedUsers[header.props.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(header.props.message.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, header.props.message, {author: this.getUserData(header.props.message.author.id, true, false, header.props.message.author)}));
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							header.props.message = message;
						}
					}
					let content = e.instance.props.childrenMessageContent;
					if (content && content.type && content.type.type) {
						let data = changedUsers[content.props.message.author.id];
						if (data) {
							let messageColor = data.color5 || (BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.coloredText) && (data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(content.props.message.channel_id) || {}).guild_id, content.props.message.author.id) || {}).colorString || data.color1));
							if (messageColor) {
								let message = new BDFDB.DiscordObjects.Message(Object.assign({}, content.props.message, {author: this.getUserData(content.props.message.author.id, true, false, content.props.message.author)}));
								if (data.name) message.nick = data.name;
								message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(messageColor) ? messageColor[0] : messageColor, "HEX");
								content.props.message = message;
							}
						}
					}
					let repliedMessage = e.instance.props.childrenRepliedMessage;
					if (repliedMessage && repliedMessage.props && repliedMessage.props.children && repliedMessage.props.children.props && repliedMessage.props.children.props.referencedMessage && repliedMessage.props.children.props.referencedMessage.message) {
						let referenceMessage = repliedMessage.props.children.props.referencedMessage.message;
						let data = changedUsers[referenceMessage.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(referenceMessage.channel_id) || {}).guild_id, header.props.message.author.id) || {}).colorString || data.color1;
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, referenceMessage, {author: this.getUserData(referenceMessage.author.id, true, false, referenceMessage.author)}));
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							repliedMessage.props.children.props.referencedMessage = Object.assign({}, repliedMessage.props.children.props.referencedMessage, {message: message});
						}
					}
				}
			}
			
			processMessageUsername (e) {
				if (e.instance.props.message && settings.changeInChatWindow) {
					let data = changedUsers[e.instance.props.message.author.id];
					if (!e.returnvalue) {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id, true, false, e.instance.props.message.author)}));
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1;
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						}
						e.instance.props.message = message;
					}
					else if (e.returnvalue.props.children) {
						if (data && (data.color1 || data.color2)) {
							let messageUsername = BDFDB.ReactUtils.findChild(e.returnvalue.props.children, {name: "Popout", props: [["className", BDFDB.disCN.messageusername]]});
							if (messageUsername) {
								if (messageUsername.props && typeof messageUsername.props.children == "function") {
									let renderChildren = messageUsername.props.children;
									messageUsername.props.children = (...args) => {
										let renderedChildren = renderChildren(...args);
										this.changeUserColor(renderedChildren, e.instance.props.message.author.id, {guildId: (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
										return renderedChildren;
									}
								}
								else this.changeUserColor(messageUsername, e.instance.props.message.author.id, {guildId: (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id});
							}
						}
						this.injectBadge(e.returnvalue.props.children, e.instance.props.message.author.id, (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.compact ? 0 : 2, {
							tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
							useRem: true
						});
					}
				}
			}
			
			processMessageContent (e) {
				if (e.instance.props.message && settings.changeInChatWindow) {
					if (!e.returnvalue) {
						if (e.instance.props.message.type != BDFDB.DiscordConstants.MessageTypes.DEFAULT) {
							let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.message, {author: this.getUserData(e.instance.props.message.author.id, true, false, e.instance.props.message.author)}));
							let data = changedUsers[e.instance.props.message.author.id];
							if (data) {
								let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1;
								if (data.name) message.nick = data.name;
								if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
							}
							e.instance.props.message = message;
							if (e.instance.props.children) e.instance.props.children.props.message = e.instance.props.message;
						}
					}
					else {
						let data = changedUsers[e.instance.props.message.author.id];
						let messageColor = data && (data.color5 || (BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.coloredText) && (data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, e.instance.props.message.author.id) || {}).colorString || data.color1)));
						if (messageColor) {
							if (BDFDB.ObjectUtils.is(messageColor)) e.returnvalue.props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(messageColor),
								children: e.returnvalue.props.children
							});
							else e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {color: BDFDB.ColorUtils.convert(messageColor, "RGBA")});
						}
					}
				}
			}
			
			processReaction (e) {
				if (e.instance.props.reactions) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id);
					let guildId = null == channel || channel.isPrivate() ? null : channel.getGuildId();
					let users = e.instance.props.reactions.filter(user => !BDFDB.LibraryModules.FriendUtils.isBlocked(user.id)).slice(0, 3).map(user => changedUsers[user.id] && changedUsers[user.id].name || guildId && BDFDB.LibraryModules.MemberStore.getNick(guildId, user.id) || user.username).filter(user => user);
					if (users.length) {
						let reaction = e.instance.props.message.getReaction(e.instance.props.emoji);
						let others = Math.max(0, (reaction && reaction.count || 0) - users.length);
						let emojiName = BDFDB.LibraryModules.ReactionEmojiUtils.getReactionEmojiName(e.instance.props.emoji);
						e.returnvalue.props.text = 
							users.length == 1 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_1_N", users[0], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_1", users[0], emojiName) :
							users.length == 2 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_2_N", users[0], users[1], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_2", users[0], users[1], emojiName) :
							users.length == 3 ? others > 0 ? BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_3_N", users[0], users[1], users[2], others, emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_3", users[0], users[1], users[2], emojiName) :
							BDFDB.LanguageUtils.LanguageStringsFormat("REACTION_TOOLTIP_N", others, emojiName);
					}
				}
				else BDFDB.LibraryModules.ReactionUtils.getReactions(e.instance.props.message.channel_id, e.instance.props.message.id, e.instance.props.emoji).then(reactions => {
					e.instance.props.reactions = reactions;
					BDFDB.ReactUtils.forceUpdate(e.instance);
				});
			}
			
			processReactorsComponent (e) {
				if (settings.changeInReactions && BDFDB.ArrayUtils.is(e.instance.props.reactors)) {
					if (!e.returnvalue) {
						for (let i in e.instance.props.reactors) if (!BDFDB.LibraryModules.MemberStore.getNick(e.instance.props.guildId, e.instance.props.reactors[i].id)) e.instance.props.reactors[i] = this.getUserData(e.instance.props.reactors[i].id, true, false, e.instance.props.reactors[i]);
					}
					else {
						let renderRow = e.returnvalue.props.renderRow;
						e.returnvalue.props.renderRow = (...args) => {
							let row = renderRow(...args);
							if (row && row.props && row.props.user && changedUsers[row.props.user.id]) {
								let type = row.type;
								row.type = (...args2) => {
									let result = type(...args2);
									let nickName = BDFDB.LibraryModules.MemberStore.getNick(row.props.guildId, row.props.user.id) && BDFDB.ReactUtils.findChild(result, {props: [["className", BDFDB.disCN.messagereactionsmodalnickname]]});
									if (nickName) {
										if (changedUsers[row.props.user.id].name) BDFDB.ReactUtils.setChild(nickName, changedUsers[row.props.user.id].name);
										this.changeUserColor(nickName, row.props.user.id);
									}
									return result;
								};
							}
							return row;
						};
					}
				}
			}
			
			processMention (e) {
				if (e.instance.props.userId && settings.changeInMentions && changedUsers[e.instance.props.userId]) {
					this.changeMention(e.returnvalue, changedUsers[e.instance.props.userId]);
				}
			}
			
			processUserMention (e) {
				if (e.instance.props.id && settings.changeInMentions) {
					let data = changedUsers[e.instance.props.id];
					if (data) {
						let tooltipChildren = BDFDB.ObjectUtils.get(e, "returnvalue.props.text.props.children");
						if (tooltipChildren) {
							if (tooltipChildren[0] && tooltipChildren[0].props && tooltipChildren[0].props.user) tooltipChildren[0].props.user = this.getUserData(tooltipChildren[0].props.user.id);
							if (data.name && typeof tooltipChildren[1] == "string") tooltipChildren[1] = data.name;
						}
						if (data.name || data.color1) {
							if (typeof e.returnvalue.props.children == "function") {
								let renderChildren = e.returnvalue.props.children;
								e.returnvalue.props.children = (...args) => {
									let children = renderChildren(...args);
									this.changeMention(children, data);
									return children;
								};
							}
							else this.changeMention(e.returnvalue, data);
						}
					}
				}
			}
			
			changeMention (mention, data) {
				if (data.name) {
					if (typeof mention.props.children == "string") mention.props.children = "@" + data.name;
					else if (BDFDB.ArrayUtils.is(mention.props.children)) {
						if (mention.props.children[0] == "@") mention.props.children[1] = data.name;
						else mention.props.children[0] = "@" + data.name;
					}
				}
				if (data.color1) {
					let color1_0 = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color1) ? data.color1[0] : data.color1, "RGBA");
					let color0_1 = mention.props.mentioned ? "transparent" : BDFDB.ColorUtils.setAlpha(color1_0, 0.1, "RGBA");
					let color0_7 = mention.props.mentioned ? "transparent" : BDFDB.ColorUtils.setAlpha(color1_0, 0.7, "RGBA");
					let white = mention.props.mentioned ? color1_0 : "#FFFFFF";
					mention.props.style = Object.assign({}, mention.props.style, {
						background: color0_1,
						color: color1_0
					});
					let onMouseEnter = mention.props.onMouseEnter || ( _ => {});
					mention.props.onMouseEnter = event => {
						onMouseEnter(event);
						event.target.style.setProperty("background", color0_7, "important");
						event.target.style.setProperty("color", white, "important");
					};
					let onMouseLeave = mention.props.onMouseLeave || ( _ => {});
					mention.props.onMouseLeave = event => {
						onMouseLeave(event);
						event.target.style.setProperty("background", color0_1, "important");
						event.target.style.setProperty("color", color1_0, "important");
					};
				}
			}

			processChannelReply (e) {
				if (e.instance.props.reply && e.instance.props.reply.message && settings.changeInChatWindow) {
					if (!e.returnvalue) {
						let message = new BDFDB.DiscordObjects.Message(Object.assign({}, e.instance.props.reply.message, {author: this.getUserData(e.instance.props.reply.message.author.id)}));
						let data = changedUsers[e.instance.props.reply.message.author.id];
						if (data) {
							let color1 = data.color1 && data.useRoleColor && (BDFDB.LibraryModules.MemberStore.getMember((BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.reply.message.channel_id) || {}).guild_id, e.instance.props.reply.message.author.id) || {}).colorString || data.color1;
							if (data.name) message.nick = data.name;
							if (color1) message.colorString = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color1) ? color1[0] : color1, "HEX");
						}
						e.instance.props.reply = Object.assign({}, e.instance.props.reply, {message: message});
					}
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.messagereplyname]]});
						if (userName) this.changeUserColor(userName, e.instance.props.reply.message.author.id);
					}
				}
			}
			
			processMemberListItem (e) {
				if (e.instance.props.user && settings.changeInMemberList) {
					if (!e.returnvalue) {
						e.instance.props.user = this.getUserData(e.instance.props.user.id);
						let data = changedUsers[e.instance.props.user.id];
						if (data) {
							if (data.name) e.instance.props.nick = data.name;
							if (data.removeStatus || data.status || data.statusEmoji) {
								e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != 4);
								let activity = this.createCustomStatus(data);
								if (activity) e.instance.props.activities.unshift(activity);
							}
						}
					}
					else {
						this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true, guildId: e.instance.props.channel.guild_id});
						this.injectBadge(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user.id, BDFDB.LibraryModules.LastGuildStore.getGuildId(), 2, {
							tagClass: BDFDB.disCN.bottagmember
						});
					}
				}
			}

			processAuditLog (e) {
				if (e.instance.props.log && settings.changeInAuditLog) {
					if (e.instance.props.log.user) e.instance.props.log.user = this.getUserData(e.instance.props.log.user.id);
					if (e.instance.props.log.target && e.instance.props.log.targetType == "USER") e.instance.props.log.target = this.getUserData(e.instance.props.log.target.id);
				}
			}

			processUserHook (e) {
				if (e.instance.props.user && settings.changeInAuditLog) {
					this.changeUserColor(e.returnvalue.props.children[0], e.instance.props.user.id);
				}
			}

			processGuildSettingsEmoji (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.emojis) && settings.changeInEmojiLog) {
					e.instance.props.emojis = [].concat(e.instance.props.emojis);
					for (let i in e.instance.props.emojis) e.instance.props.emojis[i] = Object.assign({}, e.instance.props.emojis[i], {user: this.getUserData(e.instance.props.emojis[i].user.id)});
				}
			}

			processMemberCard (e) {
				if (e.instance.props.user && settings.changeInMemberLog) e.instance.props.user = this.getUserData(e.instance.props.user.id);
			}

			processSettingsInvites (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.invites) && settings.changeInMemberLog) {
					e.instance.props.invites = Object.assign({}, e.instance.props.invites);
					for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {inviter: this.getUserData(e.instance.props.invites[id].inviter.id)}));
				}
			}

			processGuildSettingsBans (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.bans) && settings.changeInMemberLog) {
					e.instance.props.bans = Object.assign({}, e.instance.props.bans);
					for (let id in e.instance.props.bans) e.instance.props.bans[id] = Object.assign({}, e.instance.props.bans[id], {user: this.getUserData(e.instance.props.bans[id].user.id)});
				}
			}

			processInvitationCard (e) {
				if (e.instance.props.user && settings.changeInInviteList) {
					if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.invitemodalinviterowname]]});
						if (userName) this.changeUserColor(userName, e.instance.props.user.id);
					}
				}
			}

			processPrivateChannelRecipientsInvitePopout (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.results) && settings.changeInInviteList) {
					for (let result of e.instance.props.results) result.user = this.getUserData(result.user.id);
				}
			}

			processInviteModalUserRow (e) {
				if (e.instance.props.user && settings.changeInInviteList) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutddmaddnickname]]});
					if (userName) this.changeUserColor(userName, e.instance.props.user.id);
				}
			}

			processTypingUsers (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.typingUsers) && Object.keys(e.instance.props.typingUsers).length && settings.changeInTyping) {
					let users = Object.keys(e.instance.props.typingUsers).filter(id => id != BDFDB.UserUtils.me.id).filter(id => !BDFDB.LibraryModules.FriendUtils.isBlocked(id)).map(id => BDFDB.LibraryModules.UserStore.getUser(id)).filter(user => user);
					if (users.length) {
						let typingText = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.typingtext]]});
						if (typingText && BDFDB.ArrayUtils.is(typingText.props.children)) for (let child of typingText.props.children) if (child.type == "strong") {
							let userId = (users.shift() || {}).id;
							if (userId) {
								let data = changedUsers[userId];
								if (data && data.name) child.props.children = data.name;
								this.changeUserColor(child, userId);
							}
						}
					}
				}
			}

			processDirectMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInRecentDms) {
					let recipientId = e.instance.props.channel.getRecipientId();
					let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ListItemTooltip"});
					if (tooltip) tooltip.props.text = this.getUserData(recipientId).username;
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.props && !isNaN(parseInt(c.props.id))});
					if (avatar && typeof avatar.props.children == "function") {
						let childrenRender = avatar.props.children;
						avatar.props.children = (...args) => {
							let renderedChildren = childrenRender(...args);
							if (renderedChildren && renderedChildren.props) renderedChildren.props.icon = this.getUserAvatar(recipientId);
							return renderedChildren;
						};
					}
				}
			}

			processPrivateChannel (e) {
				if (e.instance.props.user && settings.changeInDmsList) {
					if (!e.returnvalue) {
						let data = changedUsers[e.instance.props.user.id];
						if (data && (data.removeStatus || data.status || data.statusEmoji)) {
							e.instance.props.activities = [].concat(e.instance.props.activities).filter(n => n.type != 4);
							let activity = this.createCustomStatus(data);
							if (activity) e.instance.props.activities.unshift(activity);
						}
					}
					else {
						e.returnvalue.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getUserData(e.instance.props.user.id).username});
						this.changeUserColor(e.returnvalue.props.name, e.instance.props.user.id, {changeBackground: true, modify: BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "hovered", "selected", "hasUnreadMessages", "muted")});
						e.returnvalue.props.name = [e.returnvalue.props.name];
						e.returnvalue.props.avatar.props.src = this.getUserAvatar(e.instance.props.user.id);
						this.injectBadge(e.returnvalue.props.name, e.instance.props.user.id, null, 1);
					}
				}
			}

			processQuickSwitchUserResult (e) {
				if (e.instance.props.user && settings.changeInQuickSwitcher) {
					if (!e.returnvalue) e.instance.props.user = this.getUserData(e.instance.props.user.id);
					else {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.quickswitchresultmatch]]});
						if (userName) {
							let data = changedUsers[e.instance.props.user.id];
							if (data && data.name) userName.props.children = data.name;
							this.changeUserColor(userName, e.instance.props.user.id, {modify: BDFDB.ObjectUtils.extract(e.instance.props, "focused", "unread", "mentions")});
						}
					}
				}
			}

			processSearchPopoutComponent (e) {
				if (BDFDB.ArrayUtils.is(BDFDB.ObjectUtils.get(e, "instance.props.resultsState.autocompletes")) && settings.changeInSearchPopout) {
					for (let autocomplete of e.instance.props.resultsState.autocompletes) if (autocomplete && BDFDB.ArrayUtils.is(autocomplete.results)) for (let result of autocomplete.results) if (result.user) result.user = this.getUserData(result.user.id);
				}
			}

			processSearchPopoutUserResult (e) {
				if (e.instance.props.result && e.instance.props.result.user && settings.changeInSearchPopout) {
					let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.searchpopoutdisplayednick]]});
					if (userName) {
						let data = changedUsers[e.instance.props.result.user.id];
						if (data && data.name) userName.props.children = data.name;
						this.changeUserColor(userName, e.instance.props.result.user.id);
					}
				}
			}
			
			processIncomingCallModal (e) {
				if (e.instance.props.channelId && settings.changeInDmCalls) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.channelId);
					if (!user) {
						let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
						if (channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM) user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
					}
					if (user) {
						let userName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.callincomingtitle]]});
						if (userName) {
							let data = changedUsers[user.id];
							if (data && data.name) userName.props.children = data.name;
							this.changeUserColor(userName, user.id);
						}
						let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.callincomingicon]]});
						if (avatar) avatar.props.src = this.getUserAvatar(user.id);
					}
				}
			}
			
			processRTCConnection (e) {
				if (e.instance.props.channel && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM && settings.changeInRecentDms && typeof e.returnvalue.props.children == "function") {
					let recipientId = e.instance.props.channel.getRecipientId();
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let renderedChildren = renderChildren(...args);
						let userName = BDFDB.ReactUtils.findChild(renderedChildren, {name: "PanelSubtext"});
						if (userName) {
							userName.props.children = "@" + this.getUserData(recipientId).username;
							this.changeUserColor(userName, recipientId);
						}
						return renderedChildren;
					};
				}
			}

			processPrivateChannelCallParticipants (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.participants) && settings.changeInDmCalls) {
					for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id, true, true);
				}
			}
			
			processChannelCall (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.participants) && settings.changeInDmCalls) {
					for (let participant of e.instance.props.participants) if (participant && participant.user) participant.user = this.getUserData(participant.user.id);
				}
			}
			
			processPictureInPictureVideo (e) {
				if (e.instance.props.backgroundKey) {
					let user = BDFDB.LibraryModules.UserStore.getUser(e.instance.props.backgroundKey);
					if (user) {
						e.instance.props.title = this.getUserData(user.id).username;
						let videoBackground = BDFDB.ReactUtils.findChild(e.instance.props.children, {name: "VideoBackground"});
						if (videoBackground && videoBackground.props.src) videoBackground.props.src = this.getUserAvatar(user.id);
					}
				}
			}

			processUserSummaryItem (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.users)) {
					for (let i in e.instance.props.users) if (e.instance.props.users[i]) e.instance.props.users[i] = this.getUserData(e.instance.props.users[i].id);
				}
			}

			changeAppTitle () {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let title = document.head.querySelector("title");
				if (title && channel && channel.type == BDFDB.DiscordConstants.ChannelTypes.DM) {
					let user = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]);
					if (user) BDFDB.DOMUtils.setText(title, "@" + this.getUserData(user.id, settings.changeInAppTitle).username);
				}
			}
			
			changeUserColor (child, userId, options = {}) {
				if (BDFDB.ReactUtils.isValidElement(child)) {
					let data = changedUsers[userId] || {};
					if (data.color1 || (data.color2 && options.changeBackground)) {
						let childProp = child.props.children ? "children" : "text";
						let color1 = data.color1 && data.useRoleColor && options.guildId && (BDFDB.LibraryModules.MemberStore.getMember(options.guildId, userId) || {}).colorString || data.color1;
						let fontColor = options.modify && !(data.useRoleColor && options.guildId) ? this.chooseColor(color1, options.modify) : color1;
						let backgroundColor = options.changeBackground && data.color2;
						let fontGradient = BDFDB.ObjectUtils.is(fontColor);
						if (BDFDB.ObjectUtils.is(child.props.style)) {
							delete child.props.style.color;
							delete child.props.style.backgroundColor;
						}
						child.props[childProp] = BDFDB.ReactUtils.createElement("span", {
							style: {
								background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
								color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
							},
							children: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(fontColor),
								children: child.props[childProp]
							}) : child.props[childProp]
						});
					}
				}
			}

			chooseColor (color, config = {}) {
				if (color) {
					if (BDFDB.ObjectUtils.is(config)) {
						if (config.mentions || config.focused || config.hovered || config.selected || config.unread || config.hasUnreadMessages || config.speaking) color = BDFDB.ColorUtils.change(color, 0.5);
						else if (config.muted || config.locked) color = BDFDB.ColorUtils.change(color, -0.5);
					}
					return color;
				}
				return null;
			}
			
			getUserData (userId, change = true, keepName = false, fallbackData) {
				let user = BDFDB.LibraryModules.UserStore.getUser(userId);
				if (!user && BDFDB.ObjectUtils.is(fallbackData) || user && BDFDB.ObjectUtils.is(fallbackData) && user.username != fallbackData.username) user = fallbackData;
				if (!user) return new BDFDB.DiscordObjects.User({});
				let data = change && changedUsers[user.id];
				if (data) {
					let newUserObject = {}, nativeObject = new BDFDB.DiscordObjects.User(user);
					for (let key in nativeObject) newUserObject[key] = nativeObject[key];
					newUserObject.tag = nativeObject.tag;
					newUserObject.createdAt = nativeObject.createdAt;
					newUserObject.username = !keepName && data.name || nativeObject.username;
					newUserObject.usernameNormalized = !keepName && data.name && data.name.toLowerCase() || nativeObject.usernameNormalized;
					if (data.removeIcon) {
						newUserObject.avatar = null;
						newUserObject.avatarURL = null;
						newUserObject.getAvatarURL = _ => {return null;};
					}
					else if (data.url) {
						newUserObject.avatar = data.url;
						newUserObject.avatarURL = data.url;
						newUserObject.getAvatarURL = _ => {return data.url;};
					}
					return newUserObject;
				}
				return new BDFDB.DiscordObjects.User(user);
			}
			
			getUserAvatar (userId, change = true) {
				let user = BDFDB.LibraryModules.UserStore.getUser(userId);
				if (!user) return "";
				let data = change && changedUsers[user.id];
				if (data) {
					if (data.removeIcon) return "";
					else if (data.url) return data.url;
				}
				return BDFDB.LibraryModules.IconUtils.getUserAvatarURL(user);
			}
			
			injectBadge (children, userId, guildId, insertIndex, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !userId) return;
				let data = changedUsers[userId];
				if (data && data.tag) {
					let memberColor = data.ignoreTagColor && (BDFDB.LibraryModules.MemberStore.getMember(guildId, userId) || {}).colorString;
					let fontColor = !config.inverted ? data.color4 : (memberColor || data.color3);
					let backgroundColor = !config.inverted ? (memberColor || data.color3) : data.color4;
					let fontGradient = BDFDB.ObjectUtils.is(fontColor);
					children.splice(insertIndex, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
						className: config.tagClass,
						useRemSizes: config.useRem,
						invertColor: config.inverted,
						style: {
							background: BDFDB.ObjectUtils.is(backgroundColor) ? BDFDB.ColorUtils.createGradient(backgroundColor) : BDFDB.ColorUtils.convert(backgroundColor, "RGBA"),
							color: fontGradient ? BDFDB.ColorUtils.convert(fontColor[0], "RGBA") : BDFDB.ColorUtils.convert(fontColor, "RGBA")
						},
						tag: fontGradient ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(fontColor),
							children: data.tag
						}) : data.tag
					}));
				}
			}
			
			createCustomStatus (data) {
				return !BDFDB.ObjectUtils.is(data) || data.removeStatus ? null : {
					created_at: (new Date()).getTime().toString(),
					emoji: data.statusEmoji,
					id: "custom",
					name: "Custom Status",
					state: data.status,
					type: 4
				}
			}

			openUserSettingsModal (user) {
				let data = changedUsers[user.id] || {};
				let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), user.id) || {};
				let activity = BDFDB.LibraryModules.StatusMetaUtils.getApplicationActivity(user.id);
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header,
					subheader: member.nick || user.username,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader1,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_username,
									className: BDFDB.disCN.marginbottom20 + " input-username",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.name,
										placeholder: member.nick || user.username,
										autoFocus: true
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_usertag,
									className: BDFDB.disCN.marginbottom20 + " input-usertag",
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.tag
									})
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: this.labels.modal_useravatar
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													className: "input-removeicon",
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeIcon,
													onChange: (value, instance) => {
														let avatarInputIns = BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(instance, `${BDFDB.ReactUtils.instanceKey}.return.return`), {key: "USERAVATAR"});
														if (avatarInputIns) {
															delete avatarInputIns.props.success;
															delete avatarInputIns.props.errorMessage;
															avatarInputIns.props.disabled = value;
															BDFDB.ReactUtils.forceUpdate(avatarInputIns);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											className: "input-useravatar",
											key: "USERAVATAR",
											success: !data.removeIcon && data.url,
											maxLength: 100000000000000000000,
											value: data.url,
											placeholder: BDFDB.UserUtils.getAvatar(user.id),
											disabled: data.removeIcon,
											onChange: (value, instance) => {
												this.checkUrl(value, instance);
											}
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: BDFDB.LanguageUtils.LanguageStrings.CUSTOM_STATUS
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													className: "input-removestatus",
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeStatus,
													onChange: (value, instance) => {
														let statusInputIns = BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(instance, `${BDFDB.ReactUtils.instanceKey}.return.return`), {key: "USERSTATUS"});
														let statusEmojiInputIns = BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(instance, `${BDFDB.ReactUtils.instanceKey}.return.return`), {key: "USERSTATUSEMOJI"});
														if (statusInputIns && statusEmojiInputIns) {
															delete statusInputIns.props.success;
															delete statusInputIns.props.errorMessage;
															statusInputIns.props.disabled = value;
															delete statusEmojiInputIns.props.emoji;
															BDFDB.ReactUtils.forceUpdate(statusInputIns, statusEmojiInputIns);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCN.emojiinputcontainer,
											children: [
												BDFDB.ReactUtils.createElement("div", {
													className: BDFDB.disCN.emojiinputbuttoncontainer,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.EmojiPickerButton, {
														className: "input-useremojistatus",
														key: "USERSTATUSEMOJI",
														emoji: data.statusEmoji,
														allowManagedEmojis: true
													})
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-userstatus",
													inputClassName: BDFDB.disCN.emojiinput,
													key: "USERSTATUS",
													maxLength: 100000000000000000000,
													value: data.status,
													placeholder: activity && activity.type == 4 && activity.state || "",
													disabled: data.removeStatus
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
													size: BDFDB.LibraryComponents.Button.Sizes.NONE,
													look: BDFDB.LibraryComponents.Button.Looks.BLANK,
													className: BDFDB.disCN.emojiinputclearbutton,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
														className: BDFDB.disCN.emojiinputclearicon,
														name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE_CIRCLE
													}),
													onClick: (e, instance) => {
														let statusInputIns = BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(instance, `${BDFDB.ReactUtils.instanceKey}.return.return`), {key: "USERSTATUS"});
														let statusEmojiInputIns = BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(instance, `${BDFDB.ReactUtils.instanceKey}.return.return`), {key: "USERSTATUSEMOJI"});
														if (statusInputIns && statusEmojiInputIns) {
															statusInputIns.props.value = "";
															delete statusEmojiInputIns.props.emoji;
															BDFDB.ReactUtils.forceUpdate(statusInputIns, statusEmojiInputIns);
														}
													}
												})
											]
										})
									]
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader2,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker1,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color1,
										number: 1
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker2,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color2,
										number: 2
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									className: "input-userolecolor",
									margin: 20,
									label: this.labels.modal_userolecolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.useRoleColor
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader3,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker3,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color3,
										number: 3,
										disabled: data.ignoreTagColor
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker4,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color4,
										number: 4,
										disabled: data.ignoreTagColor
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									className: "input-ignoretagcolor",
									margin: 20,
									label: this.labels.modal_ignoretagcolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.ignoreTagColor,
									onChange: (value, instance) => {
										let colorpicker3ins = BDFDB.ReactUtils.findOwner(instance._reactInternals.return, {props: [["number",3]]});
										let colorpicker4ins = BDFDB.ReactUtils.findOwner(instance._reactInternals.return, {props: [["number",4]]});
										if (colorpicker3ins) colorpicker3ins.setState({disabled: value});
										if (colorpicker4ins) colorpicker4ins.setState({disabled: value});
									}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader4,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker5,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color5,
										number: 5
									})
								})
							]
						})
					],
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						color: "BRAND",
						close: true,
						click: modal => {
							let oldData = Object.assign({}, data);
							
							let userNameInput = modal.querySelector(".input-username " + BDFDB.dotCN.input);
							let userTagInput = modal.querySelector(".input-usertag " + BDFDB.dotCN.input);
							let userAvatarInput = modal.querySelector(".input-useravatar " + BDFDB.dotCN.input);
							let removeIconInput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
							let userStatusInput = modal.querySelector(".input-userstatus " + BDFDB.dotCN.input);
							let userStatusEmojiPicker = modal.querySelector(".input-useremojistatus " + BDFDB.dotCN.emojiold);
							let removeStatusInput = modal.querySelector(".input-removestatus " + BDFDB.dotCN.switchinner);
							let useRoleColorInput = modal.querySelector(".input-userolecolor " + BDFDB.dotCN.switchinner);
							let ignoreTagColorInput = modal.querySelector(".input-ignoretagcolor " + BDFDB.dotCN.switchinner);
							
							data.name = userNameInput.value.trim() || null;
							data.tag = userTagInput.value.trim() || null;
							data.url = (!data.removeIcon && BDFDB.DOMUtils.containsClass(userAvatarInput, BDFDB.disCN.inputsuccess) ? userAvatarInput.value.trim() : null) || null;
							data.removeIcon = removeIconInput.checked;
							data.status = !data.removeStatus && userStatusInput.value.trim() || null;
							data.statusEmoji = !data.removeStatus && BDFDB.ReactUtils.findValue(userStatusEmojiPicker, "emoji", {up: true}) || null;
							data.removeStatus = removeStatusInput.checked;
							data.useRoleColor = useRoleColorInput.checked;
							data.ignoreTagColor = ignoreTagColorInput.checked;

							data.color1 = BDFDB.ColorUtils.getSwatchColor(modal, 1);
							data.color2 = BDFDB.ColorUtils.getSwatchColor(modal, 2);
							data.color3 = BDFDB.ColorUtils.getSwatchColor(modal, 3);
							data.color4 = BDFDB.ColorUtils.getSwatchColor(modal, 4);
							data.color5 = BDFDB.ColorUtils.getSwatchColor(modal, 5);

							let changed = false;
							if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.DataUtils.remove(this, "users", user.id);
							else if (!BDFDB.equals(oldData, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "users", user.id);
							if (changed) this.forceUpdateAll();
						}
					}]
				});
			}
			
			checkUrl (url, instance) {
				BDFDB.TimeUtils.clear(instance.checkTimeout);
				if (url == null || !url.trim()) {
					delete instance.props.success;
					delete instance.props.errorMessage;
					instance.forceUpdate();
				}
				else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => {
					BDFDB.LibraryRequires.request(url.trim(), (error, response, result) => {
						if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
							instance.props.success = true;
							delete instance.props.errorMessage;
						}
						else {
							delete instance.props.success;
							instance.props.errorMessage = this.labels.modal_invalidurl;
						}
						delete instance.checkTimeout;
						instance.forceUpdate();
					});
				}, 1000);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_localusersettings:			"Локални потребителски настройки",
							modal_colorpicker1:					"Име цвят",
							modal_colorpicker2:					"Цвят на фона",
							modal_colorpicker3:					"Цвят на етикета",
							modal_colorpicker4:					"Цвят на шрифта",
							modal_colorpicker5:					"Цвят на шрифта",
							modal_header:						"Локални потребителски настройки",
							modal_ignoretagcolor:				"Използвайте валякова боя",
							modal_invalidurl:					"Невалиден адрес",
							modal_tabheader1:					"Потребител",
							modal_tabheader2:					"Име цвят",
							modal_tabheader3:					"Цвят на етикета",
							modal_tabheader4:					"Цвят на съобщението",
							modal_useravatar:					"Потребителска снимка",
							modal_username:						"Локално потребителско име",
							modal_userolecolor:					"Не презаписвайте цвета на ролката",
							modal_usertag:						"Етикет",
							submenu_resetsettings:				"Нулиране на потребителя",
							submenu_usersettings:				"Промяна на настройките"
						};
					case "da":		// Danish
						return {
							context_localusersettings:			"Lokale brugerindstillinger",
							modal_colorpicker1:					"Navnfarve",
							modal_colorpicker2:					"Baggrundsfarve",
							modal_colorpicker3:					"Etiketfarve",
							modal_colorpicker4:					"Skriftfarve",
							modal_colorpicker5:					"Skriftfarve",
							modal_header:						"Lokale brugerindstillinger",
							modal_ignoretagcolor:				"Brug rullefarve",
							modal_invalidurl:					"Ugyldig URL",
							modal_tabheader1:					"Bruger",
							modal_tabheader2:					"Navnfarve",
							modal_tabheader3:					"Etiketfarve",
							modal_tabheader4:					"Beskedfarve",
							modal_useravatar:					"Brugerbillede",
							modal_username:						"Lokalt brugernavn",
							modal_userolecolor:					"Overskriv ikke rullefarve",
							modal_usertag:						"Etiket",
							submenu_resetsettings:				"Nulstil bruger",
							submenu_usersettings:				"Ændre indstillinger"
						};
					case "de":		// German
						return {
							context_localusersettings:			"Lokale Benutzereinstellungen",
							modal_colorpicker1:					"Namensfarbe",
							modal_colorpicker2:					"Hintergrundfarbe",
							modal_colorpicker3:					"Etikettfarbe",
							modal_colorpicker4:					"Schriftfarbe",
							modal_colorpicker5:					"Schriftfarbe",
							modal_header:						"Lokale Benutzereinstellungen",
							modal_ignoretagcolor:				"Rollenfarbe verwenden",
							modal_invalidurl:					"Ungültige URL",
							modal_tabheader1:					"Benutzer",
							modal_tabheader2:					"Namensfarbe",
							modal_tabheader3:					"Etikettfarbe",
							modal_tabheader4:					"Nachrichtenfarbe",
							modal_useravatar:					"Benutzerbild",
							modal_username:						"Lokaler Benutzername",
							modal_userolecolor:					"Rollenfarbe nicht überschreiben",
							modal_usertag:						"Etikett",
							submenu_resetsettings:				"Benutzer zurücksetzen",
							submenu_usersettings:				"Einstellungen ändern"
						};
					case "el":		// Greek
						return {
							context_localusersettings:			"Τοπικές ρυθμίσεις χρήστη",
							modal_colorpicker1:					"Χρώμα ονόματος",
							modal_colorpicker2:					"Χρώμα του φόντου",
							modal_colorpicker3:					"Χρώμα ετικέτας",
							modal_colorpicker4:					"Χρώμα γραμματοσειράς",
							modal_colorpicker5:					"Χρώμα γραμματοσειράς",
							modal_header:						"Τοπικές ρυθμίσεις χρήστη",
							modal_ignoretagcolor:				"Χρησιμοποιήστε κυλινδρικό χρώμα",
							modal_invalidurl:					"Μη έγκυρο url",
							modal_tabheader1:					"Χρήστης",
							modal_tabheader2:					"Χρώμα ονόματος",
							modal_tabheader3:					"Χρώμα ετικέτας",
							modal_tabheader4:					"Χρώμα μηνύματος",
							modal_useravatar:					"Εικόνα χρήστη",
							modal_username:						"Τοπικό όνομα χρήστη",
							modal_userolecolor:					"Μην αντικαθιστάτε το χρώμα ρολού",
							modal_usertag:						"Επιγραφή",
							submenu_resetsettings:				"Επαναφορά χρήστη",
							submenu_usersettings:				"Αλλαξε ρυθμίσεις"
						};
					case "es":		// Spanish
						return {
							context_localusersettings:			"Configuración de usuario local",
							modal_colorpicker1:					"Color del nombre",
							modal_colorpicker2:					"Color de fondo",
							modal_colorpicker3:					"Color de la etiqueta",
							modal_colorpicker4:					"Color de fuente",
							modal_colorpicker5:					"Color de fuente",
							modal_header:						"Configuración de usuario local",
							modal_ignoretagcolor:				"Usa color del rollo",
							modal_invalidurl:					"URL invalida",
							modal_tabheader1:					"Usuario",
							modal_tabheader2:					"Color del nombre",
							modal_tabheader3:					"Color de la etiqueta",
							modal_tabheader4:					"Color del mensaje",
							modal_useravatar:					"Foto de usuario",
							modal_username:						"Nombre de usuario local",
							modal_userolecolor:					"No sobrescriba el color del rollo",
							modal_usertag:						"Etiqueta",
							submenu_resetsettings:				"Restablecer usuario",
							submenu_usersettings:				"Cambiar ajustes"
						};
					case "fi":		// Finnish
						return {
							context_localusersettings:			"Paikalliset käyttäjäasetukset",
							modal_colorpicker1:					"Nimen väri",
							modal_colorpicker2:					"Taustaväri",
							modal_colorpicker3:					"Etiketin väri",
							modal_colorpicker4:					"Fontin väri",
							modal_colorpicker5:					"Fontin väri",
							modal_header:						"Paikalliset käyttäjäasetukset",
							modal_ignoretagcolor:				"Käytä rullan väriä",
							modal_invalidurl:					"Virheellinen URL",
							modal_tabheader1:					"Käyttäjä",
							modal_tabheader2:					"Nimen väri",
							modal_tabheader3:					"Etiketin väri",
							modal_tabheader4:					"Viestin väri",
							modal_useravatar:					"Käyttäjän kuva",
							modal_username:						"Paikallinen käyttäjänimi",
							modal_userolecolor:					"Älä korvaa rullan väriä",
							modal_usertag:						"Etiketti",
							submenu_resetsettings:				"Nollaa käyttäjä",
							submenu_usersettings:				"Vaihda asetuksia"
						};
					case "fr":		// French
						return {
							context_localusersettings:			"Paramètres utilisateur locaux",
							modal_colorpicker1:					"Couleur du nom",
							modal_colorpicker2:					"Couleur de l'arrière plan",
							modal_colorpicker3:					"Couleur de l'étiquette",
							modal_colorpicker4:					"Couleur de la police",
							modal_colorpicker5:					"Couleur de la police",
							modal_header:						"Paramètres utilisateur locaux",
							modal_ignoretagcolor:				"Utilisez de la couleur du rouleau",
							modal_invalidurl:					"URL invalide",
							modal_tabheader1:					"Utilisateur",
							modal_tabheader2:					"Couleur du nom",
							modal_tabheader3:					"Couleur de l'étiquette",
							modal_tabheader4:					"Couleur du message",
							modal_useravatar:					"Image de l'utilisateur",
							modal_username:						"Nom d'utilisateur local",
							modal_userolecolor:					"Ne pas écraser la couleur du rouleau",
							modal_usertag:						"Étiquette",
							submenu_resetsettings:				"Réinitialiser l'utilisateur",
							submenu_usersettings:				"Modifier les paramètres"
						};
					case "hr":		// Croatian
						return {
							context_localusersettings:			"Postavke lokalnih korisnika",
							modal_colorpicker1:					"Boja imena",
							modal_colorpicker2:					"Boja pozadine",
							modal_colorpicker3:					"Boja naljepnice",
							modal_colorpicker4:					"Boja fonta",
							modal_colorpicker5:					"Boja fonta",
							modal_header:						"Postavke lokalnih korisnika",
							modal_ignoretagcolor:				"Koristite valjkastu boju",
							modal_invalidurl:					"Neispravna poveznica",
							modal_tabheader1:					"Korisnik",
							modal_tabheader2:					"Boja imena",
							modal_tabheader3:					"Boja naljepnice",
							modal_tabheader4:					"Boja poruke",
							modal_useravatar:					"Korisnička slika",
							modal_username:						"Lokalno korisničko ime",
							modal_userolecolor:					"Nemojte prepisivati valjkastu boju",
							modal_usertag:						"Označiti",
							submenu_resetsettings:				"Resetiraj korisnika",
							submenu_usersettings:				"Promijeniti postavke"
						};
					case "hu":		// Hungarian
						return {
							context_localusersettings:			"Helyi felhasználói beállítások",
							modal_colorpicker1:					"Név színe",
							modal_colorpicker2:					"Háttér színe",
							modal_colorpicker3:					"Címke színe",
							modal_colorpicker4:					"Betű szín",
							modal_colorpicker5:					"Betű szín",
							modal_header:						"Helyi felhasználói beállítások",
							modal_ignoretagcolor:				"Használjon hengerfestéket",
							modal_invalidurl:					"Érvénytelen URL",
							modal_tabheader1:					"Felhasználó",
							modal_tabheader2:					"Név színe",
							modal_tabheader3:					"Címke színe",
							modal_tabheader4:					"Üzenet színe",
							modal_useravatar:					"Felhasználói kép",
							modal_username:						"Helyi felhasználónév",
							modal_userolecolor:					"Ne írja felül a tekercs színét",
							modal_usertag:						"Címke",
							submenu_resetsettings:				"Felhasználó visszaállítása",
							submenu_usersettings:				"Beállítások megváltoztatása"
						};
					case "it":		// Italian
						return {
							context_localusersettings:			"Impostazioni utente locale",
							modal_colorpicker1:					"Colore del nome",
							modal_colorpicker2:					"Colore di sfondo",
							modal_colorpicker3:					"Colore dell'etichetta",
							modal_colorpicker4:					"Colore del carattere",
							modal_colorpicker5:					"Colore del carattere",
							modal_header:						"Impostazioni utente locale",
							modal_ignoretagcolor:				"Usa la vernice a rullo",
							modal_invalidurl:					"URL non valido",
							modal_tabheader1:					"Utente",
							modal_tabheader2:					"Colore del nome",
							modal_tabheader3:					"Colore dell'etichetta",
							modal_tabheader4:					"Colore del messaggio",
							modal_useravatar:					"Immagine dell'utente",
							modal_username:						"Nome utente locale",
							modal_userolecolor:					"Non sovrascrivere il colore del rotolo",
							modal_usertag:						"Etichetta",
							submenu_resetsettings:				"Reimposta utente",
							submenu_usersettings:				"Cambia impostazioni"
						};
					case "ja":		// Japanese
						return {
							context_localusersettings:			"ローカルユーザー設定",
							modal_colorpicker1:					"名前の色",
							modal_colorpicker2:					"背景色",
							modal_colorpicker3:					"ラベルの色",
							modal_colorpicker4:					"フォントの色",
							modal_colorpicker5:					"フォントの色",
							modal_header:						"ローカルユーザー設定",
							modal_ignoretagcolor:				"ローラーペイントを使用する",
							modal_invalidurl:					"無効なURL",
							modal_tabheader1:					"ユーザー",
							modal_tabheader2:					"名前の色",
							modal_tabheader3:					"ラベルの色",
							modal_tabheader4:					"メッセージの色",
							modal_useravatar:					"ユーザー画像",
							modal_username:						"ローカルユーザー名",
							modal_userolecolor:					"ロールの色を上書きしないでください",
							modal_usertag:						"ラベル",
							submenu_resetsettings:				"ユーザーをリセット",
							submenu_usersettings:				"設定を変更する"
						};
					case "ko":		// Korean
						return {
							context_localusersettings:			"로컬 사용자 설정",
							modal_colorpicker1:					"이름 색상",
							modal_colorpicker2:					"배경색",
							modal_colorpicker3:					"라벨 색상",
							modal_colorpicker4:					"글자 색",
							modal_colorpicker5:					"글자 색",
							modal_header:						"로컬 사용자 설정",
							modal_ignoretagcolor:				"롤러 페인트 사용",
							modal_invalidurl:					"잘못된 URL",
							modal_tabheader1:					"사용자",
							modal_tabheader2:					"이름 색상",
							modal_tabheader3:					"라벨 색상",
							modal_tabheader4:					"메시지 색상",
							modal_useravatar:					"사용자 사진",
							modal_username:						"로컬 사용자 이름",
							modal_userolecolor:					"롤 색상을 덮어 쓰지 마십시오.",
							modal_usertag:						"상표",
							submenu_resetsettings:				"사용자 재설정",
							submenu_usersettings:				"설정 변경"
						};
					case "lt":		// Lithuanian
						return {
							context_localusersettings:			"Vietinio vartotojo nustatymai",
							modal_colorpicker1:					"Pavadinimo spalva",
							modal_colorpicker2:					"Fono spalva",
							modal_colorpicker3:					"Etiketės spalva",
							modal_colorpicker4:					"Šrifto spalva",
							modal_colorpicker5:					"Šrifto spalva",
							modal_header:						"Vietinio vartotojo nustatymai",
							modal_ignoretagcolor:				"Naudokite ritininius dažus",
							modal_invalidurl:					"Neteisingas URL",
							modal_tabheader1:					"Vartotojas",
							modal_tabheader2:					"Pavadinimo spalva",
							modal_tabheader3:					"Etiketės spalva",
							modal_tabheader4:					"Pranešimo spalva",
							modal_useravatar:					"Vartotojo nuotrauka",
							modal_username:						"Vietinis vartotojo vardas",
							modal_userolecolor:					"Neperrašykite ritinio spalvos",
							modal_usertag:						"Etiketė",
							submenu_resetsettings:				"Iš naujo nustatyti vartotoją",
							submenu_usersettings:				"Pakeisti nustatymus"
						};
					case "nl":		// Dutch
						return {
							context_localusersettings:			"Lokale gebruikersinstellingen",
							modal_colorpicker1:					"Naamkleur",
							modal_colorpicker2:					"Achtergrondkleur",
							modal_colorpicker3:					"Etiketkleur",
							modal_colorpicker4:					"Letterkleur",
							modal_colorpicker5:					"Letterkleur",
							modal_header:						"Lokale gebruikersinstellingen",
							modal_ignoretagcolor:				"Gebruik rolkleur",
							modal_invalidurl:					"Ongeldige URL",
							modal_tabheader1:					"Gebruiker",
							modal_tabheader2:					"Naamkleur",
							modal_tabheader3:					"Etiketkleur",
							modal_tabheader4:					"Bericht kleur",
							modal_useravatar:					"Gebruiker foto",
							modal_username:						"Lokale gebruikersnaam",
							modal_userolecolor:					"Overschrijf de rolkleur niet",
							modal_usertag:						"Etiket",
							submenu_resetsettings:				"Reset gebruiker",
							submenu_usersettings:				"Instellingen veranderen"
						};
					case "no":		// Norwegian
						return {
							context_localusersettings:			"Lokale brukerinnstillinger",
							modal_colorpicker1:					"Navn farge",
							modal_colorpicker2:					"Bakgrunnsfarge",
							modal_colorpicker3:					"Etikettfarge",
							modal_colorpicker4:					"Skriftfarge",
							modal_colorpicker5:					"Skriftfarge",
							modal_header:						"Lokale brukerinnstillinger",
							modal_ignoretagcolor:				"Bruk rullemaling",
							modal_invalidurl:					"Ugyldig URL",
							modal_tabheader1:					"Bruker",
							modal_tabheader2:					"Navn farge",
							modal_tabheader3:					"Etikettfarge",
							modal_tabheader4:					"Meldingens farge",
							modal_useravatar:					"Brukerbilde",
							modal_username:						"Lokalt brukernavn",
							modal_userolecolor:					"Ikke overskriv rullefargen",
							modal_usertag:						"Merkelapp",
							submenu_resetsettings:				"Tilbakestill bruker",
							submenu_usersettings:				"Endre innstillinger"
						};
					case "pl":		// Polish
						return {
							context_localusersettings:			"Lokalne ustawienia użytkownika",
							modal_colorpicker1:					"Nazwa koloru",
							modal_colorpicker2:					"Kolor tła",
							modal_colorpicker3:					"Kolor etykiety",
							modal_colorpicker4:					"Kolor czcionki",
							modal_colorpicker5:					"Kolor czcionki",
							modal_header:						"Lokalne ustawienia użytkownika",
							modal_ignoretagcolor:				"Użyj farby wałkiem",
							modal_invalidurl:					"Nieprawidłowy URL",
							modal_tabheader1:					"Użytkownik",
							modal_tabheader2:					"Nazwa koloru",
							modal_tabheader3:					"Kolor etykiety",
							modal_tabheader4:					"Kolor wiadomości",
							modal_useravatar:					"Zdjęcie użytkownika",
							modal_username:						"Lokalna nazwa użytkownika",
							modal_userolecolor:					"Nie zastępuj koloru rolki",
							modal_usertag:						"Etykieta",
							submenu_resetsettings:				"Zresetuj użytkownika",
							submenu_usersettings:				"Zmień ustawienia"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_localusersettings:			"Configurações de usuário local",
							modal_colorpicker1:					"Cor do nome",
							modal_colorpicker2:					"Cor de fundo",
							modal_colorpicker3:					"Cor da etiqueta",
							modal_colorpicker4:					"Cor da fonte",
							modal_colorpicker5:					"Cor da fonte",
							modal_header:						"Configurações de usuário local",
							modal_ignoretagcolor:				"Use tinta a rolo",
							modal_invalidurl:					"URL inválida",
							modal_tabheader1:					"Do utilizador",
							modal_tabheader2:					"Cor do nome",
							modal_tabheader3:					"Cor da etiqueta",
							modal_tabheader4:					"Cor da mensagem",
							modal_useravatar:					"Foto do usuário",
							modal_username:						"Nome de usuário local",
							modal_userolecolor:					"Não sobrescreva a cor do rolo",
							modal_usertag:						"Rótulo",
							submenu_resetsettings:				"Reiniciar usuário",
							submenu_usersettings:				"Mudar configurações"
						};
					case "ro":		// Romanian
						return {
							context_localusersettings:			"Setări locale ale utilizatorului",
							modal_colorpicker1:					"Culoarea numelui",
							modal_colorpicker2:					"Culoare de fundal",
							modal_colorpicker3:					"Culoarea etichetei",
							modal_colorpicker4:					"Culoarea fontului",
							modal_colorpicker5:					"Culoarea fontului",
							modal_header:						"Setări locale ale utilizatorului",
							modal_ignoretagcolor:				"Folosiți vopsea cu role",
							modal_invalidurl:					"URL invalid",
							modal_tabheader1:					"Utilizator",
							modal_tabheader2:					"Culoarea numelui",
							modal_tabheader3:					"Culoarea etichetei",
							modal_tabheader4:					"Culoarea mesajului",
							modal_useravatar:					"Imaginea utilizatorului",
							modal_username:						"Nume de utilizator local",
							modal_userolecolor:					"Nu suprascrieți culoarea ruloului",
							modal_usertag:						"Eticheta",
							submenu_resetsettings:				"Resetați utilizatorul",
							submenu_usersettings:				"Schimbă setările"
						};
					case "ru":		// Russian
						return {
							context_localusersettings:			"Настройки локального пользователя",
							modal_colorpicker1:					"Цвет имени",
							modal_colorpicker2:					"Фоновый цвет",
							modal_colorpicker3:					"Цвет ярлыка",
							modal_colorpicker4:					"Цвет шрифта",
							modal_colorpicker5:					"Цвет шрифта",
							modal_header:						"Настройки локального пользователя",
							modal_ignoretagcolor:				"Используйте валиковую краску",
							modal_invalidurl:					"Неверная ссылка",
							modal_tabheader1:					"Пользователь",
							modal_tabheader2:					"Цвет имени",
							modal_tabheader3:					"Цвет ярлыка",
							modal_tabheader4:					"Цвет сообщения",
							modal_useravatar:					"Изображение пользователя",
							modal_username:						"Локальное имя пользователя",
							modal_userolecolor:					"Не перезаписывайте цвет рулона",
							modal_usertag:						"Метка",
							submenu_resetsettings:				"Сбросить пользователя",
							submenu_usersettings:				"Изменить настройки"
						};
					case "sv":		// Swedish
						return {
							context_localusersettings:			"Lokala användarinställningar",
							modal_colorpicker1:					"Namnfärg",
							modal_colorpicker2:					"Bakgrundsfärg",
							modal_colorpicker3:					"Etikettfärg",
							modal_colorpicker4:					"Fontfärg",
							modal_colorpicker5:					"Fontfärg",
							modal_header:						"Lokala användarinställningar",
							modal_ignoretagcolor:				"Använd rullfärg",
							modal_invalidurl:					"Ogiltig URL",
							modal_tabheader1:					"Användare",
							modal_tabheader2:					"Namnfärg",
							modal_tabheader3:					"Etikettfärg",
							modal_tabheader4:					"Meddelandets färg",
							modal_useravatar:					"Användarbild",
							modal_username:						"Lokalt användarnamn",
							modal_userolecolor:					"Skriv inte över rullefärgen",
							modal_usertag:						"Märka",
							submenu_resetsettings:				"Återställ användare",
							submenu_usersettings:				"Ändra inställningar"
						};
					case "th":		// Thai
						return {
							context_localusersettings:			"การตั้งค่าผู้ใช้ภายใน",
							modal_colorpicker1:					"ชื่อสี",
							modal_colorpicker2:					"สีพื้นหลัง",
							modal_colorpicker3:					"สีฉลาก",
							modal_colorpicker4:					"สีตัวอักษร",
							modal_colorpicker5:					"สีตัวอักษร",
							modal_header:						"การตั้งค่าผู้ใช้ภายใน",
							modal_ignoretagcolor:				"ใช้สีลูกกลิ้ง",
							modal_invalidurl:					"URL ไม่ถูกต้อง",
							modal_tabheader1:					"ผู้ใช้",
							modal_tabheader2:					"ชื่อสี",
							modal_tabheader3:					"สีฉลาก",
							modal_tabheader4:					"สีของข้อความ",
							modal_useravatar:					"รูปภาพของผู้ใช้",
							modal_username:						"ชื่อผู้ใช้ท้องถิ่น",
							modal_userolecolor:					"อย่าเขียนทับสีม้วน",
							modal_usertag:						"ฉลาก",
							submenu_resetsettings:				"รีเซ็ตผู้ใช้",
							submenu_usersettings:				"เปลี่ยนการตั้งค่า"
						};
					case "tr":		// Turkish
						return {
							context_localusersettings:			"Yerel kullanıcı ayarları",
							modal_colorpicker1:					"İsim rengi",
							modal_colorpicker2:					"Arka plan rengi",
							modal_colorpicker3:					"Etiket rengi",
							modal_colorpicker4:					"Yazı rengi",
							modal_colorpicker5:					"Yazı rengi",
							modal_header:						"Yerel kullanıcı ayarları",
							modal_ignoretagcolor:				"Rulo boya kullanın",
							modal_invalidurl:					"Geçersiz URL",
							modal_tabheader1:					"Kullanıcı",
							modal_tabheader2:					"İsim rengi",
							modal_tabheader3:					"Etiket rengi",
							modal_tabheader4:					"Mesaj rengi",
							modal_useravatar:					"Kullanıcı resmi",
							modal_username:						"Yerel kullanıcı adı",
							modal_userolecolor:					"Rulo renginin üzerine yazmayın",
							modal_usertag:						"Etiket",
							submenu_resetsettings:				"Kullanıcıyı sıfırla",
							submenu_usersettings:				"Ayarları değiştir"
						};
					case "uk":		// Ukrainian
						return {
							context_localusersettings:			"Налаштування локального користувача",
							modal_colorpicker1:					"Колір імені",
							modal_colorpicker2:					"Колір фону",
							modal_colorpicker3:					"Колір етикетки",
							modal_colorpicker4:					"Колір шрифту",
							modal_colorpicker5:					"Колір шрифту",
							modal_header:						"Налаштування локального користувача",
							modal_ignoretagcolor:				"Використовуйте валикову фарбу",
							modal_invalidurl:					"Недійсна URL-адреса",
							modal_tabheader1:					"Користувач",
							modal_tabheader2:					"Колір імені",
							modal_tabheader3:					"Колір етикетки",
							modal_tabheader4:					"Колір повідомлення",
							modal_useravatar:					"Зображення користувача",
							modal_username:						"Локальне ім’я користувача",
							modal_userolecolor:					"Не перезаписуйте колір рулону",
							modal_usertag:						"Етикетці",
							submenu_resetsettings:				"Скинути налаштування користувача",
							submenu_usersettings:				"Змінити налаштування"
						};
					case "vi":		// Vietnamese
						return {
							context_localusersettings:			"Cài đặt người dùng cục bộ",
							modal_colorpicker1:					"Màu tên",
							modal_colorpicker2:					"Màu nền",
							modal_colorpicker3:					"Màu nhãn",
							modal_colorpicker4:					"Màu phông chữ",
							modal_colorpicker5:					"Màu phông chữ",
							modal_header:						"Cài đặt người dùng cục bộ",
							modal_ignoretagcolor:				"Sử dụng sơn lăn",
							modal_invalidurl:					"Url không hợp lệ",
							modal_tabheader1:					"Người dùng",
							modal_tabheader2:					"Màu tên",
							modal_tabheader3:					"Màu nhãn",
							modal_tabheader4:					"Màu tin nhắn",
							modal_useravatar:					"Hình ảnh người dùng",
							modal_username:						"Tên người dùng cục bộ",
							modal_userolecolor:					"Không ghi đè màu cuộn",
							modal_usertag:						"Nhãn",
							submenu_resetsettings:				"Đặt lại người dùng",
							submenu_usersettings:				"Thay đổi cài đặt"
						};
					case "zh":		// Chinese
						return {
							context_localusersettings:			"本地用户设置",
							modal_colorpicker1:					"名称颜色",
							modal_colorpicker2:					"背景颜色",
							modal_colorpicker3:					"标签颜色",
							modal_colorpicker4:					"字体颜色",
							modal_colorpicker5:					"字体颜色",
							modal_header:						"本地用户设置",
							modal_ignoretagcolor:				"使用滚筒涂料",
							modal_invalidurl:					"无效的网址",
							modal_tabheader1:					"用户",
							modal_tabheader2:					"名称颜色",
							modal_tabheader3:					"标签颜色",
							modal_tabheader4:					"留言颜色",
							modal_useravatar:					"用户图片",
							modal_username:						"本地用户名",
							modal_userolecolor:					"不要覆盖纸卷颜色",
							modal_usertag:						"标签",
							submenu_resetsettings:				"重置用户",
							submenu_usersettings:				"更改设置"
						};
					case "zh-TW":	// Chinese (Traditional)
						return {
							context_localusersettings:			"本地用戶設置",
							modal_colorpicker1:					"名稱顏色",
							modal_colorpicker2:					"背景顏色",
							modal_colorpicker3:					"標籤顏色",
							modal_colorpicker4:					"字體顏色",
							modal_colorpicker5:					"字體顏色",
							modal_header:						"本地用戶設置",
							modal_ignoretagcolor:				"使用滾筒塗料",
							modal_invalidurl:					"無效的網址",
							modal_tabheader1:					"用戶",
							modal_tabheader2:					"名稱顏色",
							modal_tabheader3:					"標籤顏色",
							modal_tabheader4:					"留言顏色",
							modal_useravatar:					"用戶圖片",
							modal_username:						"本地用戶名",
							modal_userolecolor:					"不要覆蓋紙捲顏色",
							modal_usertag:						"標籤",
							submenu_resetsettings:				"重置用戶",
							submenu_usersettings:				"更改設置"
						};
					default:		// English
						return {
							context_localusersettings:			"Local User Settings",
							modal_colorpicker1:					"Name Color",
							modal_colorpicker2:					"Background Color",
							modal_colorpicker3:					"Tag Color",
							modal_colorpicker4:					"Font Color",
							modal_colorpicker5:					"Font Color",
							modal_header:						"Local User Settings",
							modal_ignoretagcolor:				"Use Role Color",
							modal_invalidurl:					"Invalid URL",
							modal_tabheader1:					"User",
							modal_tabheader2:					"Name Color",
							modal_tabheader3:					"Tag Color",
							modal_tabheader4:					"Message Color",
							modal_useravatar:					"Avatar",
							modal_username:						"Local Username",
							modal_userolecolor:					"Do not overwrite the Role Color",
							modal_usertag:						"Tag",
							submenu_resetsettings:				"Reset User",
							submenu_usersettings:				"Change Settings"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
