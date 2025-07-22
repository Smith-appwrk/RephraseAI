import { CardFactory, TurnContext } from "@microsoft/agents-hosting";
import {
  TeamsActivityHandler,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
} from "@microsoft/agents-hosting-teams";
import * as ACData from "adaptivecards-templating";
import helloWorldCard from "./adaptiveCards/helloWorldCard.json";
import { OpenAIService } from "./openAIService";

export class ActionApp extends TeamsActivityHandler {
  //Action
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: MessagingExtensionAction
  ): Promise<MessagingExtensionActionResponse> {
    if (action.commandId === "rephrase") {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error(
            "OpenAI API key is not set in environment variables."
          );
        }
        const openai = new OpenAIService(apiKey);
        const inputText = action.data.text ?? "";
        if (!inputText.trim()) {
          throw new Error("No text provided for rephrasing.");
        }
        const rephrased = await openai.rephraseText(inputText);
        const card = CardFactory.adaptiveCard({
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: rephrased,
              wrap: true,
            },
          ],
        });
        return {
          composeExtension: {
            type: "result",
            attachmentLayout: "list",
            attachments: [card],
          },
        };

        // Return empty response to prevent additional UI
        return {
          composeExtension: {
            type: "result",
            attachmentLayout: "list",
            attachments: [],
          },
        };
      } catch (err: any) {
        // Return error as an adaptive card for better formatting
        const errorCard = CardFactory.adaptiveCard({
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: `Error: ${err.message}`,
              wrap: true,
              color: "attention",
            },
          ],
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

    // The user has chosen to create a card by choosing the 'Create Card' context menu command.
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
