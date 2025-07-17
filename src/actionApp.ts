import { CardFactory, TurnContext } from "@microsoft/agents-hosting";
import {
  TeamsActivityHandler,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
} from "@microsoft/agents-hosting-teams";
import * as ACData from "adaptivecards-templating";
import helloWorldCard from "./adaptiveCards/helloWorldCard.json";
import rephraseCard from "./adaptiveCards/rephraseCard.json";
import { OpenAIService } from "./services/openAIService";

export class ActionApp extends TeamsActivityHandler {
  private openAIService: OpenAIService;

  constructor() {
    super();
    // Initialize the OpenAI service
    this.openAIService = new OpenAIService();
  }

  //Action
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    // Check the command ID to determine which action to take
    switch (action.commandId) {
      case "rephrase":
        return await this.handleRephraseAction(action);
      default:
        // Default to the hello world card for backward compatibility
        const template = new ACData.Template(helloWorldCard);
        const card = template.expand({
          $root: {
            title: action.data.title ?? "",
            subTitle: action.data.subTitle ?? "",
            text: action.data.text ?? "",
          },
        });
        const attachment = CardFactory.adaptiveCard(card);
        return {
          composeExtension: {
            type: "result",
            attachmentLayout: "list",
            attachments: [attachment],
          },
        };
    }
  }

  /**
   * Handles the rephrasing action by sending the text to OpenAI for correction
   * @param action The messaging extension action containing the text to rephrase
   * @returns A messaging extension response with the rephrased text
   */
  private async handleRephraseAction(
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    try {
      // When fetchTask is false, the message content is in the messagePayload
      const inputText = action.messagePayload?.body?.content ?? "";

      // Use OpenAI to rephrase and correct the text
      const correctedText = await this.openAIService.rephraseText(inputText);

      // Create an adaptive card with the original and rephrased text
      const template = new ACData.Template(rephraseCard);
      const card = template.expand({
        $root: {
          originalText: inputText,
          correctedText: correctedText,
        },
      });

      const attachment = CardFactory.adaptiveCard(card);

      return {
        composeExtension: {
          type: "result",
          attachmentLayout: "list",
          attachments: [attachment],
        },
      };
    } catch (error) {
      console.error("Error in handleRephraseAction:", error);

      // Return an error card
      const errorCard = CardFactory.adaptiveCard({
        type: "AdaptiveCard",
        body: [
          {
            type: "TextBlock",
            text: "Error rephrasing text",
            wrap: true,
            size: "Large",
          },
          {
            type: "TextBlock",
            text:
              error instanceof Error ? error.message : "Unknown error occurred",
            wrap: true,
            size: "Medium",
          },
        ],
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.4",
      });

      return {
        composeExtension: {
          type: "result",
          attachmentLayout: "list",
          attachments: [errorCard],
        },
      };
    }
  }
}
