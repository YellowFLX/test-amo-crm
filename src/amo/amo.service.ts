import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FindContactDto } from './find-contact.dto';
import { AuthService } from '../auth';

export interface AmoMarketContact {
  _embedded: {
    contacts: [
      {
        id: number;
        name: string;
      },
    ];
  };
}

@Injectable()
export class AmoService {
  private accessToken: string;
  private endpoint = this.configService.get('AMO_CRM_ENDPOINT');

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.initialize();
  }

  private async initialize() {
    this.accessToken = await this.authService.accessToken();
  }

  /**
   * Find contact by query
   * @param query
   * @returns
   */
  private async getContactsByQuery(query: string) {
    return (
      await this.httpService.axiosRef<AmoMarketContact>({
        url: `${this.endpoint}/api/v4/contacts?query=${query}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })
    ).data;
  }

  /**
   * Find contact by phone or email
   * @param findContactDto
   * @returns
   */
  private async findContact(findContactDto: FindContactDto) {
    const { phone, email } = findContactDto;

    if (!phone && !email) {
      return;
    }

    return (
      (await this.getContactsByQuery(phone)) || (await this.getContactsByQuery(email))
    );
  }

  /**
   * Update contact by id
   * @param id
   * @param data
   * @returns
   */
  private async updateContact(id, { name, email, phone }: FindContactDto) {
    return (
      await this.httpService.axiosRef({
        url: `${this.endpoint}/api/v4/contacts`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        data: [
          {
            id,
            name,
            custom_fields_values: [
              {
                field_id: 1437733,
                values: [
                  {
                    value: phone,
                  },
                ],
              },
              {
                field_id: 1437735,
                values: [
                  {
                    value: email,
                  },
                ],
              },
            ],
          },
        ],
      })
    ).data;
  }

  /**
   * Create contact with data
   * @param data
   * @returns
   */
  private async createContact({ name, email, phone }: FindContactDto) {
    return (
      await this.httpService.axiosRef<AmoMarketContact>({
        url: `${this.endpoint}/api/v4/contacts`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: [
          {
            name,
            custom_fields_values: [
              {
                field_id: 1437733,
                values: [
                  {
                    value: phone,
                  },
                ],
              },
              {
                field_id: 1437735,
                values: [
                  {
                    value: email,
                  },
                ],
              },
            ],
          },
        ],
      })
    ).data;
  }

  /**
   * Create lead and bind to contact
   * @param contactId
   * @returns
   */
  private async createLead(contactId) {
    const rnd = Math.floor(Math.random() * 100000);

    return (
      await this.httpService.axiosRef({
        url: `${this.endpoint}/api/v4/leads`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        data: [
          {
            name: `Сделка #${rnd}`,
            created_by: 0,
            price: rnd,
            _embedded: {
              contacts: [
                {
                  id: contactId,
                },
              ],
            },
          },
        ],
      })
    ).data;
  }

  /**
   * Find contact and update, or create contact. After create lead and bind to contact
   * @param findContactDto
   * @returns
   */
  async upsetContactAndCreateLead(findContactDto: FindContactDto) {
    try {
      let contact = await this.findContact(findContactDto);

      if (!contact) {
        contact = await this.createContact(findContactDto);
      } else {
        contact = await this.updateContact(
          contact._embedded.contacts[0].id,
          findContactDto,
        );
      }

      if (!contact) {
        throw new Error('Contact not found');
      }

      return this.createLead(contact._embedded.contacts[0].id);
    } catch (e) {
      console.error(e.message);
    }
  }
}
