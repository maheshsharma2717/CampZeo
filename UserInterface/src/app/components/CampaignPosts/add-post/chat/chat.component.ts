import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Output, EventEmitter, Input } from '@angular/core';
import { TextGenerationService } from '../../../../services/textgeneration.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppService } from '../../../../services/app-service.service';

export interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  @Output() contentGenerated = new EventEmitter<string>();
  @Input() platform: string = 'Platform';
  showSpinner: boolean = false;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  messageId: number = 0;

  aiOptions: string[] = [];
  selectedOptionIndex: number | null = null;
  selectedText: string = '';
  showPopover: boolean = false;
  popoverPosition = { top: 0, left: 0 };
  popoverMousedown = false;
  lastMouseUp: { x: number, y: number } | null = null;

  constructor(private textGenerationService: TextGenerationService,private spinner:AppService) {}

  ngOnInit(): void {
    this.addMessage('Hello! I\'m your AI assistant. How can I help you today?', false);
    this.popoverMousedown = false;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;

    this.addMessage(this.newMessage, true);
    const userMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;
    this.selectedOptionIndex = null;
    this.selectedText = '';
    this.showPopover = false;
    this.showSpinner = false;
    const prompt = `Generate 5 engaging content options for a ${this.platform} (note- this can be a campaign post, a post on a social media platform, a text message, an email, a WhatsApp message, an RCS message, a Facebook post, an Instagram post, a LinkedIn post, a YouTube post, a Pinterest post). Respond ONLY as a numbered list in the format: Option 1: ..., Option 2: ..., Option 3: ..., Option 4: ..., Option 5: ...  also at the end create  popular hastags for every options
    \nUser request: ${userMessage}`;

    this.textGenerationService.generateText({ prompt }).subscribe({
      next: (response:any) => {
        this.addMessage(response.response, false);
       
        this.addMessage(
          'Please select the desired text from the options above to add to your input.',
          false
        );
        this.showSpinner = false;
        this.isLoading = false;
      },
      error: (error) => {
        this.addMessage('Sorry, I encountered an error. Please try again.', false);
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  onTextSelection(event: MouseEvent) {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) {
      this.showPopover = false;
      this.selectedText = '';
      this.lastMouseUp = null;
    }
  }

  useSelectedText() {
    if (this.selectedText) {
      this.contentGenerated.emit(this.selectedText);
      this.showPopover = false;
      this.selectedText = '';
    }
  }

  private addMessage(text: string, isUser: boolean, isLoading: boolean = false): ChatMessage {
    const message: ChatMessage = {
      id: ++this.messageId,
      text,
      isUser,
      timestamp: new Date(),
      isLoading
    };
    this.messages.push(message);
    return message;
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onPopoverBackdropClick(event: MouseEvent) {
    if (!this.popoverMousedown) {
      this.showPopover = false;
      this.selectedText = '';
    }
  }

  onChatMouseUp(event: MouseEvent) {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.selectedText = selection.toString();
      this.contentGenerated.emit(this.selectedText);
    } else {
      this.selectedText = '';
      this.contentGenerated.emit('');
    }
  }
}