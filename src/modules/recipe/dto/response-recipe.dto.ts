import { OmitType, ApiProperty } from '@nestjs/swagger';
import { RecipeDto } from './recipe.dto';

export class AuthorForRecipeDto {
  @ApiProperty({ example: '64c9b2f3e8a1a2b4c56789de' })
  _id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;
}

export class ResponseRecipeDto extends OmitType(RecipeDto, ['__v'] as const) {
  @ApiProperty({ type: () => AuthorForRecipeDto })
  author?: AuthorForRecipeDto;
}
